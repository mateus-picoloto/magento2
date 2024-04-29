define([
    'underscore',
    'Magento_Ui/js/grid/columns/column',
    "mage/url",
    'Magento_Ui/js/modal/alert',
    'jquery',
    'mage/translate',
    'loader'
], function (_, Column, mageUrl, alert, $, $t) {
    'use strict';

    return Column.extend({
        defaults: {
            bodyTmpl: 'Pagarme_Pagarme/ui/grid/cells/recipientStatus'
        },
        getStatusClass: function (row) {
            const status = row.status;
            if (typeof status === 'string') {
                return `recipient-status-${status}`;
            }
            return '';
        },
        getLabel: function (row) {
            let status = row.status;

            if (typeof status === 'string') {
                status = this.getStatusLabel(status);
            }

            return $t(status);
        },
        getStatusLabel: function (status) {
            let statusLabel = ''
            // Using portuguese string because mage/translate and knockout i18n were not working
            switch (status) {
                case 'registered':
                    statusLabel = 'Cadastrado';
                    break;
                case 'validation_requested':
                    statusLabel = 'Validação Solicitada'
                    break;
                case 'waiting_for_analysis':
                    statusLabel = 'Aguardando Análise'
                    break;
                case 'active':
                    statusLabel = 'Aprovado'
                    break;
                case 'disapproved':
                    statusLabel = 'Reprovado'
                    break;
                case 'suspended':
                    statusLabel = 'Suspenso'
                    break;
                case 'blocked':
                    statusLabel = 'Bloqueado'
                    break;
                case 'inactive':
                    statusLabel = 'Inativo'
                    break;
            }

            return statusLabel;
        },
        needsValidation: function (row) {
            return row.status === 'validation_requested';
        },
        generateKycLink: async function (row) {
            try {
                $('body').loader('show');
                //const url = mageUrl.build(`/rest/V1/pagarme/marketplace/recipient/kyc/link/${row.id}`);
                const url = mageUrl.build(`/rest/V1/pagarme/marketplace/recipient/kyc/link/99`);
                const response = await $.get(mageUrl.build(url));
                $('body').loader('hide');
                if (response) {
                    this.mageAlert(this.getModalContent(response.url), $t('Success!'));
                }
            } catch (e) {
                $('body').loader('hide');
                $('body').notification('clear');
                this.mageAlert(e?.responseJSON?.message, $t('Error!'));
            }
            
        },
        getModalContent: function (url) {
            // Using portuguese string because mage/translate and knockout i18n were not working
            const content = `<p><span class='pagarme-alert-text'>Atenção!</span> O recebedor já consegue vender, `
                + `mas <b>só após a validação de segurança</b> completada com sucesso ele <b>conseguirá sacar seus valores</b> `
                + `referentes às compras.</p>` 
                + `<p>Solicite que ele acesse a <b>Dashboard do Marketplace</b> para completar a validação ou envie `
                + `<a href="${url}" target="_blank">este link</a> para ele.</p>`;
            return content;
        },
        mageAlert(content, title = null) {
            const alertObject = {
                title: title,
                content: content,
                modalClass: 'pagarme-recipient-modal',
            };
            alert(alertObject);
        }
    });
});