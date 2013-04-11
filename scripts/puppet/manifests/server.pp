
# ensure that apt update is run before any packages are installed
class apt {
  exec { "apt-update":
    command => "/usr/bin/apt-get update"
  }

  # Ensure apt-get update has been run before installing any packages
  Exec["apt-update"] -> Package <| |>

}


include apt

package { "build-essential":
    ensure => "installed"

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


# class { "postgresql::server": version => "9.1",
#     listen_addresses => 'localhost',
#     max_connections => 100,
#     shared_buffers => '24MB',
# }

# postgresql::database { "geosurvey":
#   owner => "vagrant",
# }


python::venv::isolate { "/usr/local/venv/geosurvey":
  requirements => "/vagrant/server/REQUIREMENTS",
  subscribe => [Package['build-essential']],
}
