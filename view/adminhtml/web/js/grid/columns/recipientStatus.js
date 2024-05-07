define([
    'underscore',
    'Magento_Ui/js/grid/columns/column',
    "mage/url",
    'Magento_Ui/js/modal/alert',
    'jquery',
    'loader'
], function (_, Column, mageUrl, alert, $) {
    'use strict';

    // TODO: Using portuguese strings because mage/translate and knockout i18n were not working

    return Column.extend({
        defaults: {
            bodyTmpl: 'Pagarme_Pagarme/ui/grid/cells/recipientStatus'
        },
        getStatusClass: function (row) {
            const defaultClasses = 'data-grid-cell-content';
            const status = row.status;
            if (typeof status === 'string') {
                return `${defaultClasses} kyc-validation-status recipient-status-${status}`;
            }
            return defaultClasses;
        },
        getLabel: function (row) {
            let status = row.status;

            if (typeof status === 'string') {
                status = this.getStatusLabel(status);
            }

            return status;
        },
        getStatusLabel: function (status) {
            let statusLabel = ''
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
            const body = $('body');
            try {
                body.loader('show');
                const url = mageUrl.build(`/rest/V1/pagarme/marketplace/recipient/kyc/link/${row.id}`);
                const response = await $.get(mageUrl.build(url));
                body.loader('hide');
                if (response) {
                    this.mageAlert(this.getModalContent(response.url));
                    $('#kyc-copy-button').on('click', async function (){
                        const linkInput = $('#kyc-link');

                        const url = linkInput.attr("value"),
                            showSuccessMessage = () => {
                                const messageElement = $('#kyc-copy-message');

                                messageElement.html('Link copiado para a área de transferência.')
                                    .addClass('success')
                                    .fadeIn('200');

                                setTimeout(function (){
                                    messageElement.fadeOut('400');
                                }, 3000);
                            },
                            showFailMessage = () => {
                                const messageElement = $('#kyc-copy-message');

                                linkInput.prop('disabled', false)
                                    .prop('readonly', true)
                                    .focus()
                                    .select();

                                messageElement.html(
                                        'Falha ao copiar! Por favor, copie o link manualmente utilizando o campo acima.'
                                    ).addClass('error')
                                    .fadeIn('200');

                                setTimeout(function (){
                                    messageElement.fadeOut('400');
                                }, 4000);
                            };

                        if (window.isSecureContext && navigator.clipboard) {
                            try {
                                await navigator.clipboard.writeText(url);
                                showSuccessMessage();
                            } catch (err) {
                                showFailMessage();
                            }
                            return;
                        }

                        const [linkDOMElement] = linkInput;
                        linkDOMElement.select();
                        linkDOMElement.setSelectionRange(0, linkInput.val().length);
                        try {
                            document.execCommand('copy', false);
                            showSuccessMessage();
                        } catch (err) {
                            showFailMessage();
                        }
                    })
                }
            } catch (exception) {
                body.loader('hide');
                body.notification('clear');
                const errorContent = `<p>Algo deu errado, por favor tente novamente mais tarde.</p>`;
                this.mageAlert(errorContent);
            }

        },
        getModalContent: function (url) {
            return `<p><span class='pagarme-alert-text'>Atenção!</span> O recebedor já consegue vender, `
                + `mas <b>só após a validação de segurança</b> completada com sucesso ele <b>conseguirá sacar seus valores</b> `
                + `referentes às compras.</p>`
                + `<p>Solicite que ele acesse a <b>Dashboard do Marketplace</b> para completar a validação ou envie o `
                + `link abaixo para ele.</p>`
                + `<div class="kyc-link-container"><input type="text" id="kyc-link" value="${url}" disabled/>`
                + `<button id="kyc-copy-button">Copiar</button><span id="kyc-copy-message"></span></div>`;
        },
        mageAlert(content) {
            const alertObject = {
                title: 'Validação solicitada',
                content: content,
                modalClass: 'pagarme-recipient-modal',
                buttons: []
            };
            alert(alertObject);
        }
    });
});
