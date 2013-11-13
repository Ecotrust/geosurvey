describe('Storage Service', function() {

    var service,
        userJSON = '{"user":{"username":"testUser"}}';

    beforeEach(function() {
        module('askApp');
        inject(function(storage) {
            service = storage;
        });
    });

    it('saveState: Should save state.', function() {

        localStorage.setItem = jasmine.createSpy("localStorage setItem spy");
        service.saveState({
            user: {
                username: "testUser"
            }
        });
        expect(localStorage.setItem).toHaveBeenCalledWith('hapifis-testUser', userJSON);
        expect(localStorage.setItem).toHaveBeenCalledWith('hapifis', '{"currentUser":"testUser"}');
    });

    it('getState: Should restore state.', function() {
        localStorage.getItem = jasmine.createSpy("localStorage getItem spy").andReturn(userJSON);

        var state = service.getState('testUser');
        expect(localStorage.getItem).toHaveBeenCalledWith('hapifis-testUser');
        expect(state.user.username).toBe('testUser');
    });

    it('clearCache: should clear all hapifis keys', function () {
        Object.keys = jasmine.createSpy("keys getItem spy").andReturn(["hapifis-testUser", "hapifis-test2"]);
        localStorage.removeItem = jasmine.createSpy('remove item spy').andReturn(null);
        service.clearCache();
        
        expect(Object.keys).toHaveBeenCalled();
        expect(localStorage.removeItem).toHaveBeenCalledWith('hapifis-testUser');
        expect(localStorage.removeItem).toHaveBeenCalledWith('hapifis-test2');
        expect(localStorage.removeItem.calls.length).toBe(2);

    });

    it('getCurrentUser: Should get the last logged in username.', function() {
        localStorage.getItem = jasmine.createSpy("localStorage getItem spy").andReturn('{"currentUser":"testUser"}');

        var user = service.getCurrentUser();
        expect(localStorage.getItem).toHaveBeenCalledWith('hapifis');
        expect(user).toBe('testUser');
    });



    it('getStateForUser: Should get the state for a specific user.', function() {
        localStorage.getItem = jasmine.createSpy("localStorage getItem spy").andReturn(JSON.stringify({ user: { username: "testUserPerson" }}));

        var state = service.getStateForUser('testUserPerson');
        expect(localStorage.getItem).toHaveBeenCalledWith('hapifis-testUserPerson');
        expect(state.user.username).toBe("testUserPerson");
    });
});