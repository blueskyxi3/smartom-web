def APP_HOME="/app/smartom-web"
def ARTS_HOME="/app/artifacts"

pipeline {
    agent any

    parameters {
        gitParameter name: 'BRANCH_TAG', type: 'PT_BRANCH_TAG', defaultValue: 'master', listSize: '1', sortMode: 'DESCENDING_SMART', description: 'Select branch to build'
        choice choices: ['app@192.168.127.57(stage)', 'app@192.168.101.231(prod)'], description: 'Choose the server to deploy', name: 'SERVER'
    }

    stages {
        stage('Build') {
            steps {
                // remove the old package first
                sh 'rm -f dist.tar.gz'
                sh 'rm -rf dist'
                // Run npm commands to build tarball
                nodejs(nodeJSInstallationName: 'node13.12.0') {
                    script {
                        final profile = params.SERVER.substring(params.SERVER.indexOf('(') + 1, params.SERVER.indexOf(')'))
                        sh "npm i"
                        sh "npm audit fix"
                        sh "npm run build:${profile}"
                        sh "tar -czf ./dist.tar.gz ./dist"
                    }
                }
            }
            post {
                success {
                    echo "SmartOM Build Completed"
                }
            }
        }
        stage('Deploy') {
            steps {
                sshagent(credentials : ['default-app-creds']) {
                    script {
                        final server = params.SERVER.substring(0, params.SERVER.indexOf('('))
                        // Cleanup historical artifacts
                        sh "ssh -o StrictHostKeyChecking=no ${server} rm -f ${ARTS_HOME}/*smartom-web*.*"

                        // upload tarball
                        sh "scp dist.tar.gz ${server}:${ARTS_HOME}/smartom-web.tar.gz"

                        // decompress the tarball
                        sh "ssh -o StrictHostKeyChecking=no ${server} tar -xzvf ${ARTS_HOME}/smartom-web.tar.gz --directory ${ARTS_HOME}"
                        // deploy new program
                        sh "ssh -o StrictHostKeyChecking=no ${server} rm -rf ${APP_HOME}/*"
                        sh "ssh -o StrictHostKeyChecking=no ${server} mv ${ARTS_HOME}/dist/* ${APP_HOME}/"
                        // fix the 403 error after deploying
                        sh "ssh -o StrictHostKeyChecking=no ${server} chcon -Rt httpd_sys_content_t ${APP_HOME}"
                    }
                }
            }
        }
    }
}