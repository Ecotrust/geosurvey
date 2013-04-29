'use strict';

describe('Controller: RespondantListCtrl', function() {

  // load the controller's module
  beforeEach(module('askApp'));

  var RespondantListCtrl, $httpBackend, scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function(_$httpBackend_, $rootScope, $routeParams, $controller) {
    $httpBackend = _$httpBackend_;

    

    $httpBackend.expectGET('/api/v1/respondant/?format=json').respond({
      "meta": {
        "limit": 20,
        "next": null,
        "offset": 0,
        "previous": null,
        "total_count": 4
      },
      "objects": [{
        "email": "test@gmail.com",
        "resource_uri": "/api/v1/respondant/b97cbc5f-70da-4045-8874-daf14ac8207a/",
        "ts": "2013-04-11T16:17:07.318217",
        "uuid": "b97cbc5f-70da-4045-8874-daf14ac8207a"
      }, {
        "email": "eknuth@ecotrust.org",
        "resource_uri": "/api/v1/respondant/a352a35e-89a2-43b9-894c-35927145f19e/",
        "ts": "2013-04-11T16:53:42.446518",
        "uuid": "a352a35e-89a2-43b9-894c-35927145f19e"
      }, {
        "email": "eknuth@gmail.com",
        "resource_uri": "/api/v1/respondant/6da31551-7fb2-4ef8-b645-5dd46c5bed6e/",
        "ts": "2013-04-11T17:32:15.290855",
        "uuid": "6da31551-7fb2-4ef8-b645-5dd46c5bed6e"
      }, {
        "email": "test@test.com",
        "resource_uri": "/api/v1/respondant/7f04ded6-0f2e-4992-9d94-e8ea7d2a117a/",
        "ts": "2013-04-12T17:24:52",
        "uuid": "7f04ded6-0f2e-4992-9d94-e8ea7d2a117a"
      }]
    });

    scope = $rootScope.$new();
    RespondantListCtrl = $controller('RespondantListCtrl', {
      $scope: scope
    });
  }));

  it('should attach a list of respondants to the scope', function() {
    $httpBackend.flush()
    expect(scope.respondants.length).toBe(4);
  });
});