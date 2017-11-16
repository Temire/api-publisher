;(function(angular) {
    'use strict';

    angular.module('app.ctrl.modals.support', [])

/// ==== CreateSupportTicket Controller
        .controller('CreateSupportTicketCtrl',
            function ($scope, $uibModal, $state, serviceVersion, ServiceSupportTickets,
                      currentUserModel, toastService, TOAST_TYPES) {

                $scope.newTicket = {
                    title: '',
                    description: ''
                };
                $scope.createTicket = createTicket;
                $scope.modalClose = modalClose;
                $scope.serviceVersion = serviceVersion;

                function createTicket() {
                    ServiceSupportTickets.save({orgId: serviceVersion.service.organization.id,
                            svcId: serviceVersion.service.id},
                        $scope.newTicket,
                        function (reply) {
                            modalClose();
                            console.log(reply);
                            toastService.createToast(TOAST_TYPES.SUCCESS, '<b>Ticket created!</b>', true);
                            $state.forceReload();
                        }, function (error) {
                            modalClose();
                            toastService.createErrorToast(error, 'Could not create ticket');
                        }
                    );
                }
                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                }

            })

        /// ==== ViewSupportTicket Controller
        .controller('ViewSupportTicketCtrl',
            function ($scope, $uibModal, $state, currentUser, ticket, user, serviceVersion,
                      ServiceTicketComments, ServiceSupportTickets, toastService, TOAST_TYPES) {

                $scope.modalClose = modalClose;
                $scope.comments = [];
                $scope.comment = '';
                $scope.currentUser = currentUser;
                $scope.ticket = ticket;
                $scope.user = user;
                $scope.serviceVersion = serviceVersion;
                $scope.addComment = addComment;
                $scope.deleteIssue = deleteIssue;
                $scope.closeIssue = closeIssue;
                $scope.reOpenIssue = reOpenIssue;
                $scope.editIssue = editIssue;
                $scope.saveIssue = saveIssue;
                $scope.cancelEdit = cancelEdit;
                $scope.isServiceOwner = isServiceOwner;
                $scope.isOwnIssue = isOwnIssue;
                $scope.editMode = false;
                var originalTitle = ticket.title;
                var originalDescription = ticket.description;
                $scope.isUnedited = isUnedited;

                ServiceTicketComments.query({supportId: $scope.ticket.id}, function (reply) {
                    $scope.comments = reply;
                    $scope.comments.sort(function (a, b) {
                        return a.createdOn - b.createdOn;
                    });
                });

                function addComment() {
                    var commentObject = {
                        comment: $scope.comment
                    };
                    ServiceTicketComments.save({supportId: $scope.ticket.id}, commentObject, function (reply) {
                        $scope.comment = '';
                        $scope.commentForm.$setUntouched();
                        $scope.comments.push(reply);
                        toastService.createToast(TOAST_TYPES.INFO, '<b>Comment posted.</b>', true);
                    });
                }

                function deleteIssue() {
                    ServiceSupportTickets.remove({orgId: $scope.ticket.organizationId,
                        svcId: $scope.ticket.serviceId, supportId: $scope.ticket.id}, function (reply) {
                        $scope.modalClose();
                        toastService.createToast(TOAST_TYPES.WARNING, '<b>Ticket deleted.</b>', true);
                    });
                }

                function closeIssue() {
                    updateIssue('CLOSED', true);
                }

                function reOpenIssue() {
                    updateIssue('OPEN', true);
                }

                function editIssue() {
                    $scope.editMode = !$scope.editMode;
                }

                function saveIssue() {
                    updateIssue(null, false);
                    editIssue();
                }

                function updateIssue(status, closeAndReload) {
                    var ticketObject;
                    if (status === null || status === undefined || status.length === 0) {
                        ticketObject = {
                            title: $scope.ticket.title,
                            description: $scope.ticket.description,
                            status: $scope.ticket.status
                        };
                    } else {
                        ticketObject = {
                            title: $scope.ticket.title,
                            description: $scope.ticket.description,
                            status: status
                        };
                    }
                    ServiceSupportTickets.update({orgId: $scope.ticket.organizationId,
                            svcId: $scope.ticket.serviceId, supportId: $scope.ticket.id}, ticketObject,
                        function (reply) {
                            if (closeAndReload) {
                                $scope.modalClose();
                            }
                            if (status === null || status === undefined || status.length === 0) {
                                toastService.createToast(TOAST_TYPES.INFO, '<b>Ticket updated.</b>', true);
                            } else {
                                switch (status) {
                                    case 'OPEN':
                                        toastService.createToast(TOAST_TYPES.INFO, '<b>Ticket reopened!</b>', true);
                                        break;
                                    case 'CLOSED':
                                        toastService.createToast(TOAST_TYPES.INFO, '<b>Ticket closed.</b>', true);
                                        break;
                                }
                            }
                        }, function (error) {
                            toastService.createErrorToast(error, 'Could not update issue');
                        }
                    );
                }

                function cancelEdit() {
                    $scope.ticket.title = originalTitle;
                    $scope.ticket.description = originalDescription;
                    editIssue();
                }

                function modalClose() {
                    $scope.$close();	// this method is associated with $uibModal scope which is this.
                    $state.forceReload();
                }

                function isServiceOwner() {
                    return $scope.serviceVersion.createdBy === $scope.currentUser.currentUser.username;
                }

                function isOwnIssue() {
                    return $scope.ticket.createdBy === $scope.currentUser.currentUser.username;
                }

                function isUnedited() {
                    return $scope.ticket.title === originalTitle && $scope.ticket.description === originalDescription;
                }

            });

    // #end
})(window.angular);
