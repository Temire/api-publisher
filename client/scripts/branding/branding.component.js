(function () {
    'use strict';

    angular.module('app.branding')
        .component('apiBrandingList', {
            templateUrl: 'views/components/branding/component-branding-list.html',
            bindings: {
                branding: '<'
            },
            controller: function (BrandingService, toastService, _) {
                this.addBranding = addBranding;
                this.deleteBranding = deleteBranding;
                var controller = this;
                this.$onInit = function () {
                    controller.branding = _.sortBy(controller.branding, 'name');
                };

                function addBranding(name) {
                    return BrandingService.createBranding(name).then(function (result) {
                        controller.branding = _.sortBy(_.concat(controller.branding, [result]), 'name');
                        toastService.success('Branding name added!');
                    }, function (err) {
                        toastService.createErrorToast(err, 'Could not add branding!');
                    })
                }

                function deleteBranding(id) {
                    return BrandingService.deleteBranding(id).then(function () {
                        _.remove(controller.branding, function (b) {
                            return b.id === id;
                        });
                        toastService.warning('Branding name deleted!');
                    }, function (err) {
                        toastService.createErrorToast(err, 'Could not delete branding!');
                    })
                }
            }
        })
        .component('apiBrandingAdd', {
            templateUrl: 'views/components/branding/component-branding-add.html',
            require: {
                list: '^apiBrandingList'
            },
            controller: function () {
                this.addBranding = addBranding;

                function addBranding(name) {
                    if (name && name.length > 0) this.list.addBranding(name).then(function () {
                        name = '';
                    });
                }
            }

        })
        .component('apiBranding', {
            templateUrl: 'views/components/branding/component-branding.html',
            require: {
                list: '^apiBrandingList'
            },
            bindings: {
                brandingEntry: '<'
            },
            controller: function () {
                this.cancelDeleteBranding = cancelDeleteBranding;
                this.deleteBranding = deleteBranding;
                this.doConfirmDelete = doConfirmDelete;
                var controller = this;

                function cancelDeleteBranding() {
                    controller.confirm = false;
                }

                function deleteBranding() {
                    this.list.deleteBranding(controller.brandingEntry.id);
                }

                function doConfirmDelete() {
                    controller.confirm = true;
                }

            }
        });

})();
