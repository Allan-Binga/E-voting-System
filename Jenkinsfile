/* groovylint-disable-next-line CompileStatic */
pipeline {
    agent any
    tools {
        nodejs 'NodeJS 18'  //Node.js
    }
    stages {
        stage('Clone Repository') {
            steps {
                //CLONE GITHUB REPOSITORY
                git 'https://github.com/Allan-Binga/E-voting-System'
            }
        }
        stage('Install Dependencies') {
            steps {
                    sh 'npm install'
            }
        }
    }
    post {
        success {
            slackSend(
            channel: '#e-voting-system',
            color: 'good',
            message: 'Successfully installed dependencies.'
        )
        }
        failure {
            slackSend(
            /* groovylint-disable-next-line DuplicateStringLiteral */
            channel: '#e-voting-system',
            color: 'danger',
            /* groovylint-disable-next-line DuplicateStringLiteral */
            message: 'Successfully installed dependencies.'
        )
    }
    }
}
