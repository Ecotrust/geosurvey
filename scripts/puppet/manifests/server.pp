
# ensure that apt update is run before any packages are installed
class apt {
  exec { "apt-update":
    command => "/usr/bin/apt-get update"
  }

  # Ensure apt-get update has been run before installing any packages
  Exec["apt-update"] -> Package <| |>

}


include apt

package { "python-software-properties":
    ensure => "installed"
}


exec { "add-apt":
  command => "/usr/bin/add-apt-repository -y ppa:chris-lea/node.js && /usr/bin/apt-get update",
  subscribe => Package["python-software-properties"],
  unless => '/usr/bin/test -x /etc/apt/sources.list.d/chris-lea-node_js-precise.list',
}


package { "build-essential":
    ensure => "installed"

}

package { "nodejs":
    ensure => "latest",
    subscribe => Exec['add-apt'],
}


package { "postfix":
    ensure => "installed"

}

package { "mailutils":
    ensure => "installed"

}


package { "git-core":
    ensure => "latest"
}

package { "subversion":
    ensure => "latest"
}

package { "mercurial":
    ensure => "latest"
}

package { "csstidy":
    ensure => "latest"
}

package { "python-gdal":
    ensure => "latest"
}
package { "vim":
    ensure => "latest"
}


package { "python-psycopg2":
    ensure => "latest"
}

package { "python-virtualenv":
    ensure => "latest"
}

package { "python-dev":
    ensure => "latest"
}

package { "redis-server":
    ensure => "latest"
}



class { "postgresql::server": version => "9.1",
    listen_addresses => 'localhost',
    max_connections => 100,
    shared_buffers => '24MB',
}

postgresql::database { "geosurvey":
  owner => "vagrant",
}


python::venv::isolate { "/usr/local/venv/geosurvey":
  requirements => "/vagrant/server/requirements.txt",
  subscribe => [Package['build-essential']],
}

# exec { "Install Bower":
#   subscribe => [ Package["nodejs"] ],
#   command => "/usr/bin/npm install -g yo grunt-cli bower",
#   unless => "/usr/bin/test -x /usr/bin/yo"
# }

# exec { "Install Deps":
#   subscribe => [ Exec["Install Bower"] ],
#   user => 'vagrant',
#   command => "/usr/bin/npm install && /usr/bin/bower install --dev",
#   cwd => '/vagrant'

# }
