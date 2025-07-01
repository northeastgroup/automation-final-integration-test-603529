```javascript
const zapier = require('zapier-platform-core');

const App = {
  version: require('./package.json').version,
  platformVersion: zapier.version,
  
  authentication: {
    type: 'custom',
    fields: [
      {key: 'api_key', type: 'string'}
    ],
    test: {
      url: 'https://api.github.com/user'
    }
  },

  triggers: {
    new_commit: {
      noun: 'Commit',
      display: {
        label: 'New Commit',
        description: 'Triggers when a new commit is pushed to the main repository.'
      },
      operation: {
        perform: {
          url: 'https://api.github.com/repos/{{bundle.authData.username}}/main/commits',
          method: 'GET',
          headers: {
            'User-Agent': 'Zapier'
          }
        },
        type: 'hook',
        performSubscribe: {
          url: 'https://api.github.com/repos/{{bundle.authData.username}}/main/hooks',
          method: 'POST',
          headers: {
            'User-Agent': 'Zapier'
          },
          body: JSON.stringify({
            name: 'web',
            active: true,
            events: ['push'],
            config: {
              url: '{{bundle.targetUrl}}',
              content_type: 'json'
            }
          })
        },
        performUnsubscribe: {
          url: 'https://api.github.com/repos/{{bundle.authData.username}}/main/hooks/{{bundle.subscribeData.id}}',
          method: 'DELETE',
          headers: {
            'User-Agent': 'Zapier'
          }
        }
      }
    }
  },

  actions: {
    run_test_suite: {
      noun: 'Test',
      display: {
        label: 'Run Test Suite',
        description: 'Runs the test suite on the new commit.'
      },
      operation: {
        perform: {
          url: 'https://jenkins.example.com/job/test-suite/build',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            parameter: 'GIT_COMMIT',
            value: '{{bundle.inputData.commit_id}}'
          })
        }
      }
    },
    send_slack_notification: {
      noun: 'Notification',
      display: {
        label: 'Send Slack Notification',
        description: 'Sends a Slack notification with the test results.'
      },
      operation: {
        perform: {
          url: 'https://slack.com/api/chat.postMessage',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            channel: '#dev-team',
            text: 'Test suite completed for commit {{bundle.inputData.commit_id}}. Results: {{bundle.inputData.result}}'
          })
        }
      }
    },
    deploy_to_staging: {
      noun: 'Deployment',
      display: {
        label: 'Deploy to Staging',
        description: 'Deploys the application to the staging environment if all tests pass.'
      },
      operation: {
        perform: {
          url: 'https://api.aws.com/deploy',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            environment: 'staging',
            commit_id: '{{bundle.inputData.commit_id}}'
          })
        }
      }
    },
    notify_team_via_email: {
      noun: 'Email',
      display: {
        label: 'Notify Team via Email',
        description: 'Sends an email notification to the team.'
      },
      operation: {
        perform: {
          url: 'https://api.sendgrid.com/v3/mail/send',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            personalizations: [{
              to: [{
                email: 'team@example.com'
              }],
              subject: 'Deployment Successful for Commit {{bundle.inputData.commit_id}}'
            }],
            content: [{
              type: 'text/plain',
              value: 'The application has been successfully deployed to staging for commit {{bundle.inputData.commit_id}}.'
            }]
          })
        }
      }
    }
  }
};

module.exports = App;
```