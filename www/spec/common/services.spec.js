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

  describe('CacheService', function() {
    var CacheService;
    beforeEach(inject(function(_CacheService_) {
      CacheService = _CacheService_;
      var obj = {
        count: 5,
        words: 'Hello, World',
        subObj: {
          a: 'foo',
          b: 'bar'
        }
      };
      CacheService.add('obj', obj);
    }));

    it('can get data', function() {
      var ret = CacheService.get('obj');
      expect(CacheService.get('obj2')).not.toBeDefined();
      expect(ret.count).toEqual(5);
      expect(ret.words).toEqual('Hello, World');
      expect(ret.subObj).toBeDefined();
      expect(ret.subObj.a).toEqual('foo');
      expect(ret.subObj.b).toEqual('bar');
    });

    it('can find data', function() {
      expect(CacheService.has('obj')).toBeTruthy();
      expect(CacheService.has('hoonja')).toBeFalsy();
    });

    it('can remove data', function() {
      CacheService.remove('hoonja');
      expect(CacheService.has('obj')).toBeTruthy();
      CacheService.remove('obj');
      expect(CacheService.has('obj')).toBeFalsy();
    });
  });

  describe('PlaceManager', function() {
    var PlaceManager;
    beforeEach(inject(function(_PlaceManager_) {
      PlaceManager = _PlaceManager_;
    }));

    describe('test saveCurrentPlace()', function() {
      // 모든 것이 완벽하게 제공된 모범 케이스
      it('saves place with normal object.', function() {
        var obj = {
          images: [
            'http://cfile4.uf.tistory.com/image/2773F53C565C0DA82E6FDB',
            'http://cfile22.uf.tistory.com/image/266D083F569293D5017133',
            'http://cfile9.uf.tistory.com/image/263C533D56CEDA0B099CE9'
          ],
          note: 'This is note. And #this is #tag.',
          coords: {
            latitude: 0.0,
            longitude: 1.0
          }
        };
        var result = PlaceManager.saveCurrentPlace(obj);
        expect(result.placeKey.length).toEqual(32);
        expect(result.imageCount).toEqual(3);
        expect(result.tagCount).toEqual(2);
        expect(result.hasCoords).toEqual(true);
        expect(result.result).toEqual(true);
      });

      // 이미지 첨부가 안 된 경우에는 저장할 수 없음
      it('saves place with non-image object.', function() {
        var obj = {
          note: 'This is note. And #this is #tag.',
          coords: {
            latitude: 0.0,
            longitude: 1.0
          }
        };
        expect(PlaceManager.saveCurrentPlace(obj).result).not.toEqual(true);

        obj = {
          images: [],
          note: 'This is note. And #this is #tag.',
          coords: {
            latitude: 0.0,
            longitude: 1.0
          }
        };
        expect(PlaceManager.saveCurrentPlace(obj).result).not.toEqual(true);
      });

      // 노트가 없는 경우에는 저장이 가능
      it('saves place with non-note object', function() {
        var obj = {
          images: [
            'http://cfile4.uf.tistory.com/image/2773F53C565C0DA82E6FDB'
          ],
          coords: {
            latitude: 0.0,
            longitude: 1.0
          }
        };
        var result = PlaceManager.saveCurrentPlace(obj);
        expect(result.result).toEqual(true);
        expect(result.placeKey.length).toEqual(32);
        expect(result.tagCount).toEqual(0);
      });

      // 현재 저장의 경우 좌표가 없으면 저장에 실패해야 함
      it('saves place with non-cooords object.', function() {
        var obj = {
          images: [
            'http://cfile4.uf.tistory.com/image/2773F53C565C0DA82E6FDB'
          ]
        };
        var result = PlaceManager.saveCurrentPlace(obj);
        expect(result.result).not.toEqual(true);
        expect(result.placeKey).not.toBeDefined();
        expect(result.hasCoords).not.toBeDefined();
      });
    });
  })
});
