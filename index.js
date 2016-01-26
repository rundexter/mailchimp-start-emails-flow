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
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var accessToken = dexter.provider('mailchimp').credentials('access_token'),
            server = dexter.environment('mailchimp_server'),
            inputs = util.pickInputs(step, pickInputs),
            validateErrors = util.checkValidateErrors(inputs, pickInputs);

        if (!server)
            return this.fail('A [mailchimp_server] environment need for this module.');

        if (validateErrors)
            return this.fail(validateErrors);

        request({
            method: 'POST',
            baseUrl: 'https://' + server + '.api.mailchimp.com/3.0',
            uri: 'automations/' + inputs.workflow_id + '/actions/start-all-emails',
            json: true,
            auth: {
                bearer: accessToken
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
