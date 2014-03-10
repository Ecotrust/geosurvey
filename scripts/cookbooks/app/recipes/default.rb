# example recipe
# ============


if platform?("debian", "ubuntu")
    $user = "www-data"
    $group = "www-data"
    execute "clean it" do
        command "apt-get clean -y"
    end

    execute "update package index" do
        command "apt-get update"
    end
end

if platform?("centos", "rhel")
    $user = "nginx"
    $group = "nginx"    

    # execute "clean it" do
    #     command "yum clean all"
    # end

    # execute "update package index" do
    #     command "yum update -y"
    # end
end


group "deploy" do
    gid 123
end

if node[:user] == "vagrant"

    user "vagrant" do
        group "deploy"
    end
    user $user
    template "/home/vagrant/.bashrc" do
        source "bashrc.erb"
        owner "vagrant"
    end
else
    user $user do
        group "deploy"
    end
    node[:users].each do |u|
        user u[:name] do
            username u[:name]
            shell "/bin/bash"
            home "/home/#{u[:name]}"
            group "deploy"
        end

        directory "/home/#{u[:name]}" do
            owner u[:name]
            group "deploy"
            mode 0700
        end

        directory "/home/#{u[:name]}/.ssh" do
            owner u[:name]
            group "deploy"
            mode 0700
        end

        template "/home/#{u[:name]}/.bashrc" do
            source "bashrc.erb"
            owner u[:name]
            mode 0700
        end

        cookbook_file "/home/#{u[:name]}/.profile" do
            source "profile"
            owner u[:name]
            mode 0700
        end

        execute "authorized keys" do
            command "echo #{u[:key]} > /home/#{u[:name]}/.ssh/authorized_keys"
        end
    end

    cookbook_file "/etc/sudoers" do
        source "sudoers"
        mode 0440
    end
    
    # package "dos2unix"
    # execute "authorized keys" do
    #     command "dos2unix /etc/sudoers"
    # end
end

directory "/srv/downloads" do
    owner $user
    group "deploy"
    mode 0770
end


directory "/usr/local/apps" do
    owner $user
    group "deploy"
    mode 0770
end

directory "/usr/local/apps/#{node[:project]}" do
    owner $user
    group "deploy"
    mode 0770
end

directory "/srv/downloads" do
    owner $user
    group "deploy"
    mode 0770
end

directory "/usr/local/apps/#{node[:project]}/#{node[:app]}" do
    owner $user
    group "deploy"
    mode 0770
end


directory "/usr/local/venv" do
    owner $user
    group "deploy"
    mode 0770
end

if platform?("debian", "ubuntu")
    cookbook_file "/etc/ssh/sshd_config" do
        source "sshd_config"
    end
    execute "restart ssh" do
        command "service ssh restart"
    end
else platform?("centos", "rhel")
    cookbook_file "/etc/ssh/sshd_config_centos" do
        source "sshd_config"
    end

    execute "restart ssh" do
        command "service sshd restart"
    end
end

package "wget"

if platform?("centos", "rhel")
    cookbook_file "/etc/yum.repos.d/CentOS-Base.repo" do
        source "CentOS-Base.repo"
    end
    bash "install other repos" do
        user "root"
        cwd "/tmp"
        not_if do ::File.exists?('/etc/yum.repos.d/epel.repo') end
        code <<-EOH    
            wget http://ftp.osuosl.org/pub/fedora-epel/6/i386/epel-release-6-8.noarch.rpm
            wget http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
            wget http://yum.postgresql.org/9.1/redhat/rhel-6-x86_64/pgdg-centos91-9.1-4.noarch.rpm
            rpm -ivh epel-release-6-8.noarch.rpm remi-release-6.rpm pgdg-centos91-9.1-4.noarch.rpm
        EOH
    end
end

#ssl 
directory "/etc/nginx" do
    owner "root"
    group "root"
    mode 0751
end

directory "/etc/nginx/ssl" do
    owner "root"
    group "root"
    mode 0700
end


cookbook_file "server.crt" do
  path "/etc/nginx/ssl/server.crt"
  action :create_if_missing
end
cookbook_file "server.key" do
  path "/etc/nginx/ssl/server.key"
  action :create_if_missing
end


package "mercurial"
package "subversion"
package "unzip"
package "python-pip"
package "ntp"
package "curl"
package "postfix"

case node["platform_family"]
when "debian"
    package "python-software-properties"
    package "htop"
    package "csstidy"
    package "python-dev"
    package "mailutils"
    package "postgresql-#{node[:postgresql][:version]}-postgis"
    package "vim"
    package "munin-node"
    package "munin"
    include_recipe "apt"
    include_recipe "build-essential"
when "rhel"
    package "python-devel"
    package "mailx"
    package "postgresql91"
    package "postgresql91-server"
    package "postgresql91-contrib"
    package "postgresql91-libs"
    package "postgresql91-devel"
    package "postgis2_91"
end



include_recipe "openssl"
include_recipe "git"
include_recipe "nginx"
package "python-kombu"
package "python-imaging"





case node["platform_family"]
when "debian"
  package "python-psycopg2"
  package "python-numpy"
  package "redis-server"

  template "/etc/init/app.conf" do
      source "app.conf.erb"
  end

  cookbook_file "/etc/postgresql/#{node[:postgresql][:version]}/main/pg_hba.conf" do
      source "pg_hba.conf"
      owner "postgres"
  end
  execute "restart postgres" do
      command "sudo /etc/init.d/postgresql restart"
  end

when "rhel"
    package "redis"

    template "/etc/init/app.conf" do
        source "app.conf.erb"
    end



    # execute "start app" do
    #     command "sudo initctl start app"
    # end

    execute "install dev tools" do
        command "yum -y groupinstall 'Development Tools'"
    end

    execute "initialize db" do
        command "sudo -u postgres /usr/pgsql-9.1/bin/initdb -D /var/lib/pgsql/9.1/data"
        not_if do ::File.exists?("/var/lib/pgsql/9.1/data/PG_VERSION") end
    end


    cookbook_file "/var/lib/pgsql/9.1/data/pg_hba.conf" do
        source "pg_hba.conf"
        owner "postgres"
    end


    execute "start postgres on boot" do
        command "chkconfig postgresql-9.1 on"
    end
    execute "restart postgres" do
        command "sudo /etc/init.d/postgresql-9.1 start"
    end
    execute "create database user" do
        command "createuser -U postgres -s vagrant"
        not_if "psql -U postgres -c '\\du' |grep vagrant", :user => 'postgres'
    end
end



if node[:user] == "vagrant"
    execute "create database user" do
        command "createuser -U postgres -s vagrant"
        not_if "psql -U postgres -c '\\du' |grep vagrant", :user => 'postgres'
    end
end

execute "create database" do
    command "createdb -U postgres -T template0 -O postgres #{node[:dbname]} -E UTF8 --locale=en_US.UTF-8"
    not_if "psql -U postgres --list | grep #{node[:dbname]}", :user => 'postgres'
end

case node["platform_family"]
when "debian"
    execute "load postgis" do
        command "psql  -U postgres -d #{node[:dbname]} -f /usr/share/postgresql/9.1/contrib/postgis-1.5/postgis.sql"
        not_if "psql -U postgres #{node[:dbname]} -P pager -t --command='SELECT tablename FROM pg_catalog.pg_tables'|grep spatial_ref_sys"
    end
    execute "load spatial references" do
        command "psql -U postgres  -d #{node[:dbname]} -f /usr/share/postgresql/9.1/contrib/postgis-1.5/spatial_ref_sys.sql"
        not_if "psql -U postgres #{node[:dbname]} -P pager -t --command='SELECT srid FROM  spatial_ref_sys' |grep 900913"
    end
when "rhel"
    execute "load plpgsql" do
        command "createlang -U postgres -d #{node[:dbname]} plpgsql"
        not_if "psql -U postgres #{node[:dbname]} -P pager -t --command='select * from pg_language'|grep plpgsql"
    end
    execute "load postgis" do
        command "psql  -U postgres -d #{node[:dbname]} -f /usr/pgsql-9.1/share/contrib/postgis-2.0/spatial_ref_sys.sql"
        not_if "psql -U postgres #{node[:dbname]} -P pager -t --command='SELECT tablename FROM pg_catalog.pg_tables'|grep spatial_ref_sys"
    end
    execute "load spatial references" do
        command "psql -U postgres  -d #{node[:dbname]} -f /usr/pgsql-9.1/share/contrib/postgis-2.0/postgis.sql"
        not_if "psql -U postgres #{node[:dbname]} -P pager -t --command='SELECT srid FROM  spatial_ref_sys' |grep 900913"
    end
    execute "start redis" do
        command "sudo /etc/init.d/redis start"
    end
    execute "start redis on boot" do
        command "sudo chkconfig redis on"
    end
    execute "install virtualenv" do
        command "sudo pip install virtualenv"
    end

end
python_virtualenv "/usr/local/venv/#{node[:project]}" do
    action :create
    group "deploy"
    options "--system-site-packages"
    if node[:user] == "vagrant"
        owner "vagrant"
    else
        owner $user
    end
end
link "/usr/venv" do
  to "/usr/local/venv"
end

link "/usr/include/Python.h" do
    to "/usr/include/python2.6/Python.h"
end

script 'create swapfile' do
  interpreter 'bash'
  not_if { File.exists?('/var/swapfile') }
  code <<-eof
    dd if=/dev/zero of=/var/swapfile bs=1024 count=512k
    chmod 600 /var/swapfile &&
    mkswap /var/swapfile
  eof
end

mount '/dev/null' do  # swap file entry for fstab
  action :enable  # cannot mount; only add to fstab
  device '/var/swapfile'
  fstype 'swap'
end

script 'activate swap' do
  interpreter 'bash'
  code 'swapon -a'
end