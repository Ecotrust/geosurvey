import os
from tempfile import mkdtemp
from contextlib import contextmanager

from fabric.operations import put
from fabric.api import env, local, sudo, run, cd, prefix, task, settings

branch = 'master'

CHEF_VERSION = '10.20.0'

project = "geosurvey"
app = "server"

env.root_dir = "/usr/local/apps/%s" % project
env.venvs = '/usr/local/venv'
env.virtualenv = '%s/%s' % (env.venvs, project)
env.activate = 'source %s/bin/activate ' % env.virtualenv
env.code_dir = '%s/%s' % (env.root_dir, app)
env.media_dir = '%s/media' % env.root_dir


@contextmanager
def _virtualenv():
    with prefix(env.activate):
        yield


def _manage_py(command):
    run('python manage.py %s'
            % command)


@task
def install_chef(latest=True):
    """
    Install chef-solo on the server
    """
    sudo('apt-get update', pty=True)
    sudo('apt-get install -y git-core rubygems ruby ruby-dev', pty=True)

    if latest:
        sudo('gem install chef --no-ri --no-rdoc', pty=True)
    else:
        sudo('gem install chef --no-ri --no-rdoc --version {0}'.format(CHEF_VERSION), pty=True)

def parse_ssh_config(text):
    """
    Parse an ssh-config output into a Python dict.

    Because Windows doesn't have grep, lol.
    """
    try:
        lines = text.split('\n')
        lists = [l.split(' ') for l in lines]
        lists = [filter(None, l) for l in lists]

        tuples = [(l[0], ''.join(l[1:]).strip().strip('\r')) for l in lists]

        return dict(tuples)

    except IndexError:
        raise Exception("Malformed input")


def set_env_for_user(user='example'):
    if user == 'vagrant':
        # set ssh key file for vagrant
        result = local('vagrant ssh-config', capture=True)
        data = parse_ssh_config(result)

        try:
            env.user = user
            env.host_string = 'vagrant@127.0.0.1:%s' % data['Port']
            env.key_filename = data['IdentityFile'].strip('"')
        except KeyError:
            raise Exception("Missing data from ssh-config")


@task
def up():
    """
    Provision with Chef 11 instead of the default.

    1.  Bring up VM without provisioning
    2.  Remove all Chef and Moneta
    3.  Install latest Chef
    4.  Reload VM to recreate shared folders
    5.  Provision
    """
    local('vagrant up --no-provision')

    set_env_for_user('vagrant')

    sudo('gem uninstall --no-all --no-executables --no-ignore-dependencies chef moneta')
    install_chef(latest=False)
    local('vagrant reload')
    local('vagrant provision')


@task
def bootstrap(username=None):
    set_env_for_user(username)

    # Bootstrap
    #run('test -e %s || ln -s /vagrant/marco %s' % (env.code_dir, env.code_dir))
    with cd(env.code_dir):
        with _virtualenv():
            run('pip install -r requirements.txt')
            _manage_py('syncdb --noinput')
            # _manage_py('add_srid 99996')
            _manage_py('migrate')
            # _manage_py('collectstatic --noinput')
            # _manage_py('enable_sharing')
@task
def createsuperuser(username=None):
    set_env_for_user(username)

    # Bootstrap
    #run('test -e %s || ln -s /vagrant/marco %s' % (env.code_dir, env.code_dir))
    with cd(env.code_dir):
        with _virtualenv():
            _manage_py('createsuperuser')

@task
def runserver():
    set_env_for_user('vagrant')
    with cd(env.code_dir):
        with _virtualenv():
            _manage_py('runserver 0.0.0.0:8000')
@task
def push():
    """
    Update application code on the server
    """
    with settings(warn_only=True):
        remote_result = local('git remote | grep %s' % env.remote)
        if not remote_result.succeeded:
            local('git remote add %s ssh://%s@%s:%s%s' %
                (env.remote, env.user, env.host, env.port,env.root_dir))

        result = local("git push %s %s" % (env.remote, env.branch))

        # if push didn't work, the repository probably doesn't exist
        # 1. create an empty repo
        # 2. push to it with -u
        # 3. retry
        # 4. profit

        if not result.succeeded:
            # result2 = run("ls %s" % env.code_dir)
            # if not result2.succeeded:
            #     run('mkdir %s' % env.code_dir)
            print "Creating remote repo, now."
            with cd(env.root_dir):
                run("git init")
                run("git config --bool receive.denyCurrentBranch false")
                local("git push %s -u %s" % (env.remote, env.branch))

    with cd(env.root_dir):
        # Really, git?  Really?
        run('git checkout %s' % env.branch)
        run('git reset HEAD')
        run('git checkout .')
        run('git checkout %s' % env.branch)

        sudo('chown -R www-data:deploy *')
        sudo('chown -R www-data:deploy /usr/local/venv')
        sudo('chmod -R 0770 *')


@task
def deploy():
    set_env_for_user(env.user)

    push()
    sudo('chmod -R 0770 %s' % env.virtualenv)

    with cd(env.code_dir):
        with _virtualenv():
            run('pip install -r requirements.txt')
            _manage_py('collectstatic --noinput')
            _manage_py('syncdb --noinput')
            # _manage_py('add_srid 99996')
            _manage_py('migrate')
            # _manage_py('enable_sharing')
            sudo('chown -R www-data:deploy %s/public/static' % env.root_dir)


    restart()


@task
def restart():
    """
    Reload nginx/gunicorn
    """
    with settings(warn_only=True):
        sudo('supervisorctl restart app')
        sudo('/etc/init.d/nginx reload')
@task
def restore(file=None):
    if file is not None:
        run(" pg_restore --verbose --clean --no-acl --no-owner -d %s /vagrant/%s" % (project, file))

@task
def vagrant(username='vagrant'):
    # set ssh key file for vagrant
    set_env_for_user(username)
    result = local('vagrant ssh-config', capture=True)
    data = parse_ssh_config(result)
    env.remote = 'vagrant'
    env.branch = branch
    env.host = '127.0.0.1'
    env.port = data['Port']
    env.code_dir = '/vagrant/%s' % app

    try:
        env.host_string = '%s@127.0.0.1:%s' % (username, data['Port'])
    except KeyError:
        raise Exception("Missing data from ssh-config")


@task
def staging(connection):
    env.remote = 'staging'
    env.role = 'staging'
    env.branch = branch
    env.user, env.host = connection.split('@')
    env.port = 22
    env.host_string = '%s@%s:%s' % (env.user, env.host, env.port)


def upload_project_sudo(local_dir=None, remote_dir=""):
    """
    Copied from Fabric and updated to use sudo.
    """
    local_dir = local_dir or os.getcwd()

    # Remove final '/' in local_dir so that basename() works
    local_dir = local_dir.rstrip(os.sep)

    local_path, local_name = os.path.split(local_dir)
    #tar_file = "%s.tar.gz" % local_name
    #target_tar = os.path.join(remote_dir, tar_file)
    zip_file = "%s.zip" % local_name
    target_zip = os.path.join(remote_dir, zip_file)
    target_zip = target_zip.replace('\\','/')
    tmp_folder = mkdtemp()
    try:
        #tar_path = os.path.join(tmp_folder, tar_file)
        zip_path = os.path.join(tmp_folder, zip_file)
        #local("tar -czf %s -C %s %s" % (tar_path, local_path, local_name))
        #local("tar -czf %s %s" % (tar_path, local_dir))
        zipdir(local_dir, zip_path)
        #put(tar_path, target_tar, use_sudo=True)
        put(zip_path, target_zip, use_sudo=True)
        with cd(remote_dir):
            try:
                #sudo("tar -xzf %s" % tar_file)
                sudo("apt-get install -y unzip")
                sudo("unzip %s" % zip_file)
            finally:
                #sudo("rm -f %s" % tar_file)
                sudo("rm -f %s" % zip_file)
    finally:
        pass
        #local("rm -rf %s" % tmp_folder)

def zipdir(basedir, archivename):
    from zipfile import ZipFile, ZIP_DEFLATED
    from contextlib import closing
    with closing(ZipFile(archivename, "w", ZIP_DEFLATED)) as z:
        for root, dirs, files in os.walk(basedir):
            #NOTE: ignoring empty directories
            for fn in files:
                absfn = os.path.join(root, fn)
                zfn = absfn[len(basedir)+len(os.sep):] #XXX: relative path
                z.write(absfn, zfn)

@task
def sync_config():
    sudo("rm -rf /etc/chef")
    #upload_project_sudo(local_dir='./scripts/cookbooks', remote_dir='/etc/chef')
    sudo('mkdir -p /etc/chef/cookbooks')
    upload_project_sudo(local_dir='./scripts/cookbooks', remote_dir='/etc/chef/cookbooks')
    #upload_project_sudo(local_dir='./scripts/roles/', remote_dir='/etc/chef')
    sudo('mkdir -p /etc/chef/roles')
    upload_project_sudo(local_dir='./scripts/roles', remote_dir='/etc/chef/roles')


@task
def provision():
    """
    Run chef-solo
    """
    sync_config()

    node_name = "node_%s.json" % (env.role)

    with cd('/etc/chef/cookbooks'):
        sudo('chef-solo -c /etc/chef/cookbooks/solo.rb -j /etc/chef/cookbooks/%s' % node_name, pty=True)


@task
def prepare():
    install_chef(latest=False)
    provision()
