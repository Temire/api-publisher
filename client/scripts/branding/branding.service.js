(function () {
    'use strict';

    angular.module('app.branding')
        .service('BrandingService', brandingService);


    function brandingService(Branding, ServiceBranding) {
        this.addBrandingToService = addBrandingToService;
        this.createBranding = createBranding;
        this.deleteBranding = deleteBranding;
        this.getBranding = getBranding;
        this.getBrandings = getBrandings;
        this.removeBrandingFromService = removeBrandingFromService;


        function addBrandingToService(orgId, svcId, branding) {
            return ServiceBranding.save({ orgId: orgId, svcId: svcId }, branding).$promise;
        }
        
        function createBranding(brandingName) {
            return Branding.save({}, { name: brandingName}).$promise;
        }
        
        function deleteBranding(brandingId) {
            return Branding.delete({ brandingId: brandingId }).$promise;
        }

        function getBranding(brandingId) {
            return Branding.get({ brandingId: brandingId }).$promise;
        }

        function getBrandings() {
            return Branding.query().$promise;
        }

        function removeBrandingFromService(orgId, svcId, brandingId) {
            return ServiceBranding.delete({ orgId: orgId, svcId: svcId, brandingId: brandingId }).$promise;
        }
    }

})();
