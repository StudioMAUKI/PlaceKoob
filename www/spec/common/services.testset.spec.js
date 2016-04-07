'use strict';
beforeEach(module('placekoob'));

describe('placekoob.services', function() {
  describe('UPostsService', function() {
    var UPostsService;
    var place = {
      userPost: {
        name: '마우키스튜디오',
        notes: [{
          content: '울회사',
          uuid: '3AD38881EC6AE1DA6D172FB111714339.stxt'
        },{
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
        images: [],
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

    beforeEach(inject(function(_UPostsService_) {
      UPostsService = _UPostsService_;
    }));

    it('tests to get post list', function() {
      var posts = UPostsService.getPostsOfMine();
      expect(posts.count).toEqual(15);
      expect(posts.results.length).toEqual(15);
    });

    it('tests to get proper name of place', function() {
      expect(UPostsService.getName(place)).toEqual('(주)마우키스튜디오');
    });

    it('tests to get address', function() {
      expect(UPostsService.getAddress()).toEqual('Not yet');
    });

    it('tests to get phone number', function() {
      expect(UPostsService.getPhoneNo()).toEqual('Not yet');
    });

    it('tests to get array of tags', function() {
      expect(UPostsService.getTags(place.userPost.notes[1].content).length).toEqual(3);
    });

    it('test to get proper url of image', function() {
      expect(UPostsService.getImageURL(place.placePost.images[0].uuid)).toEqual('http://maukitest.cloudapp.net/media/images/0DC200ED17A056ED448EF8E1C3952B94.img');
    });

    it('tests to get list of the locatable posts.', function() {
      expect(UPostsService.getLocatablePosts().count).toEqual(11);
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
