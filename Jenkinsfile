node {
    checkout scm

    try {
        stage 'Login to Amazon ECR'
        sh "make login"

        stage 'Create release environment and run acceptance tests'
        sh 'make release'

        stage 'Tag and publish release image'
        sh "make tag latest \$(git rev-parse --short HEAD) \$(git tag --points-at HEAD)"
        sh "make buildtag master \$(git tag --points-at HEAD)"
        sh "make publish"

        stage 'Deploy release'
        sh "printf \$(git rev-parse --short HEAD) > tag.tmp"
        def imageTag = readFile 'tag.tmp'
        build job: DEPLOY_JOB, parameters: [[
            $class: 'StringParameterValue',
            name: 'IMAGE_TAG',
            value: '845778257277.dkr.ecr.ap-southeast-2.amazonaws.com/ratecity/keystone:' + imageTag
        ]]

    }
    finally {
        stage 'Clean up'
        sh 'make clean'
        sh 'make logout'
    }
}
