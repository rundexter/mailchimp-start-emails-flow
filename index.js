var request = require('request'),
    util = require('./util'),
    pickInputs = {
        workflow_id: { key: 'workflow_id', validate: { req: true } }
    },
    pickOutputs = {
        total_items: 'total_items',
        _links: '_links',
        id: { key: 'automations', fields: ['id'] },
        status: { key: 'automations', fields: ['status'] },
        emails_sent: { key: 'automations', fields: ['emails_sent'] },
        recipients: { key: 'automations', fields: ['recipients'] },
        tracking: { key: 'automations', fields: ['tracking'] },
        report_summary: { key: 'automations', fields: ['report_summary'] }
    };

module.exports = {
    authOptions: function (dexter) {
        if (!dexter.environment('mailchimp_api_key') || !dexter.environment('server')) {
            this.fail('A [mailchimp_api_key] and [server] environment variables are required for this module');
            return false;
        } else {
            return {
                api_key: dexter.environment('mailchimp_api_key'),
                server: dexter.environment('server')
            }
        }
    },
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var auth = this.authOptions(dexter),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (!auth) return;

        if (validateErrors)
            return this.fail(validateErrors);

        request({
            method: 'POST',
            baseUrl: 'https://' + auth.server + '.api.mailchimp.com/3.0',
            uri: 'automations/' + inputs.workflow_id + '/actions/start-all-emails',
            json: true,
            auth: {
                username: 'api_key',
                password: auth.api_key
            }
        },
        function (error, response, body) {
            if (!error && (response.statusCode === 200 || response.statusCode === 204)) {
                this.complete({});
            } else {
                this.fail(error || body);
            }
        }.bind(this));
    }
};
