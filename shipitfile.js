var request = require('request')

var servers = {
  staging: [
    'dev@ultimate-staging01.ratecity.com.au',
    'dev@ultimate-staging02.ratecity.com.au',
  ],
  production: [
    'dev@ultimate-production01.ratecity.com.au',
    'dev@ultimate-production02.ratecity.com.au',
  ],
}

module.exports = function (shipit) {
  require('shipit-deploy')(shipit)

  var path = require('path')

  var deployBase = '/home/dev/ultimate'
  var currentDeployment = deployBase + '/current'
  var currentRelease = ''

  var environment = shipit.options.environment

  shipit.initConfig({
    default: {
      workspace: '/tmp/ultimate',
      deployTo: deployBase,
      repositoryUrl: 'git@github.com:ratecity/ultimate.git',
      ignores: ['.git', 'node_modules'],
      rsync: ['--del'],
      deleteOnRollback: true,
      keepReleases: 5,
    },
    staging: {
      servers: servers.staging,
    },
    production: {
      servers: servers.production,
    },
  })

  shipit.on('published', function () {
    shipit.start('post-publish')
  })

  shipit.on('updated', function () {
    currentRelease = path.join(shipit.releasesPath, shipit.releaseDirname)

    shipit.start('post-update')
  })

  shipit.task('post-update', ['slack', 'env-symlink', 'newrelic-log-symlink', 'npm-install'])
  shipit.task('post-publish', ['pm2-reload', 'pm2-save'])

  shipit.blTask('slack', function (cb) {
    var workspace = shipit.config.workspace

    shipit.local('git rev-parse HEAD', {cwd: workspace}).then(function (res) {
      request({
        method: 'POST',
        uri: 'https://hooks.slack.com/services/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',
        json: true,
        body: {
          username: 'Ultimate',
          text: `<!channel> Ultimate ${shipit.environment} deploy - ${process.env.USER} https://github.com/ratecity/ultimate/commit/${res.stdout}`,
        },
      },
      function (error, response, body) {
        if (error) {
          return console.error('upload failed:', error) // eslint-disable-line no-console
        }
        console.log('Upload successful!  Server responded with:', body) // eslint-disable-line no-console
        return cb()
      })
    })
  })

  shipit.blTask('env-symlink', function () {
    return shipit.remote('ln -sf ' + deployBase + '/shared/.env ' + currentRelease + '/.env')
  })

  shipit.blTask('newrelic-log-symlink', function () {
    return shipit.remote('ln -sf ' + deployBase + '/shared/newrelic_agent.log ' + currentRelease + '/newrelic_agent.log')
  })

  shipit.blTask('npm-install', function () {
    return shipit.remote('(cd ' + currentRelease + ' && npm install)')
  })

  shipit.blTask('pm2-reload', function () {
    return shipit.remote('sudo pm2 gracefulReload ' + currentDeployment + '/ecosystem.json')
  })

  shipit.blTask('pm2-save', function () {
    return shipit.remote('sudo pm2 save')
  })
}
