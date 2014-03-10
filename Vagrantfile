# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
    #config.vm.box = "precise32"
    #config.vm.box_url = "http://files.vagrantup.com/precise32.box"
    config.vm.box = "opscode_centos-6.4_provisionerless"
    config.vm.box_url = "https://opscode-vm-bento.s3.amazonaws.com/vagrant/opscode_centos-6.4_provisionerless.box"
    config.vm.network :forwarded_port, guest: 8000, host: 8000  # django dev server
    config.vm.network :forwarded_port, guest: 80, host: 8080  # nginx
    config.vm.network :forwarded_port, guest: 443, host: 8443  # nginx
    config.vm.network :forwarded_port, guest: 5432, host: 15432  # postgresql

    #config.vm.synced_folder "~/.pip/downloads", "/tmp/pip-cache", disabled: true


    config.vm.hostname = "geosurvey"

    config.vm.provider :virtualbox do |vb|
        vb.customize ["modifyvm", :id, "--memory", 512]
    end

    config.omnibus.chef_version = "10.20.0"

    config.vm.provision :chef_solo do |chef|
        chef.cookbooks_path = "scripts/cookbooks"
        chef.roles_path = "scripts/roles"
        chef.json  = {
            :user => "vagrant",
            :servername => "example.example.com",
            :dbname => "geosurvey",
            :project => "geosurvey",
            :app => "server",
            :staticfiles => "/usr/local/apps/marine-planner/mediaroot",
            :postgresql => {
                :password => {
                    :postgres  => "SECRET"
                }
            }
        }
        chef.add_role "vagrant"
    end
end
