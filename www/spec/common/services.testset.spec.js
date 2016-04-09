'use strict';
beforeEach(module('placekoob'));

describe('placekoob.services', function() {
  describe('DummyRemoteAPIService', function() {
    var DummyRemoteAPIService;
    var PostHelper;
    var place = {
      userPost: {
        name: '마우키스튜디오',
        notes: [{
          content: '사무실 #진도는안나가고 #스트레스받고 #개발을관두지말걸그랬어 미쵸미쵸',
          uuid: '3AD38881EC6AE1DA6D172FB111714339.stxt'
        }],
        place_id: 14,
        lps: [],
        lonLat: null,
        urls: [{
          content: 'www. maukistudio.com',
          uuid: '27F5D229515052F9EB1AFDDE78CA6DDD.url'
        }],
        images: [{
          note: null,
          content: '/media/images/0DC200ED17A056ED448EF8E1C3952B94.img',
          uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'
        }],
        posDesc: null
      },
      placePost: {
        name: '(주)마우키스튜디오',
        notes: [{
          content: '울회사',
          uuid: '3AD38881EC6AE1DA6D172FB111714339.stxt'
        }],
        place_id: 14,
        lps: [],
        lonLat: null,
        urls: [{
          content: 'www. maukistudio.com',
          uuid: '27F5D229515052F9EB1AFDDE78CA6DDD.url'
        }],
        images: [{
          note: null,
          content: null,
          uuid: '0DC200ED17A056ED448EF8E1C3952B94.img'
        }],
        posDesc: null
      }
    }

    beforeEach(inject(function(_DummyRemoteAPIService_) {
      DummyRemoteAPIService = _DummyRemoteAPIService_;
    }));

    beforeEach(inject(function(_PostHelper_) {
      PostHelper = _PostHelper_;
    }));

    it('tests to get post list', function() {
      DummyRemoteAPIService.getPostsOfMine()
      .then(function(posts) {
        expect(posts.count).toEqual(15);
        expect(posts.results.length).toEqual(15);
      });
    });

    it('tests to get proper name of place', function() {
      expect(PostHelper.getPlaceName(place)).toEqual('(주)마우키스튜디오');
    });

    it('tests to get address', function() {
      expect(PostHelper.getAddress(place)).toEqual('미지정 상태');
    });

    it('tests to get phone number', function() {
      expect(PostHelper.getPhoneNo(place)).toEqual('미지정 상태');
    });

    it('tests to get array of tags', function() {
      expect(PostHelper.getTags(place).length).toEqual(3);
    });

    it('test to get proper url of image', function() {
      expect(PostHelper.getFirstImageURL(place)).toEqual('/mauki/media/images/0DC200ED17A056ED448EF8E1C3952B94.img');
    });

    it('tests to get list of the locatable posts.', function() {
      DummyRemoteAPIService.getPostsWithPlace()
      .then(function(posts) {
        expect(posts.count).toEqual(11);
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
