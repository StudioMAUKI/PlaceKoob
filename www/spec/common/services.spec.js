'use strict';
beforeEach(module('placekoob'));

describe('placekoob.services', function() {
  describe('md5Encrypter', function() {
    var md5Encrypter;

    it('encrypt string value to MD5 hashed value.', function() {
      inject(function($injector){
        md5Encrypter = $injector.get('md5Encrypter');
      });
      expect(md5Encrypter.encrypt('https://blueimp.github.io/JavaScript-MD5/')).toEqual('5927539d8264b073efa5bd729560c5f0');
    });
  });

  describe('UUIDGenerator', function() {
    var uuidGenerator;

    it('generates UUID value based on VD and timestamp', function() {
      inject(function($injector) {
        uuidGenerator = $injector.get('UUIDGenerator');
      });
      var UUID = uuidGenerator.getUUID();
      expect(UUID.length).toEqual(32);
      expect(UUID.slice(16)).toMatch(/[\d|A-F|a-f]{16}/);
      expect(parseInt(UUID.slice(16), 16)).not.toBeGreaterThan(parseInt(Date.now()));
    });
  });

  describe('PKDBManager', function() {
    var PKDBManager;

    beforeEach(inject(function(_PKDBManager_) {
      PKDBManager = _PKDBManager_;
    }));

    describe('tests basic function', function() {
      it('initialize DB connection', function() {
        expect(PKDBManager.init()).toBeDefined();
        expect(PKDBManager.getDB()).not.toBeNull();
      });

      it('close DB connection', function() {
        expect(PKDBManager.close()).toBeNull();
      });

      it('excute SQL statements.', function() {
        spyOn(PKDBManager, 'init').and.callThrough();
        PKDBManager.execute();
        expect(PKDBManager.init).toHaveBeenCalled();
      });
    });

    xdescribe('> Each query', function() {
      var PKQueries;

      beforeEach(inject(function(_PKQueries_){
        PKQueries = _PKQueries_;
      }));

      it('tests to create table users', function() {
        expect(PKDBManager.execute).toThrow();
      })
    });
  });
});
