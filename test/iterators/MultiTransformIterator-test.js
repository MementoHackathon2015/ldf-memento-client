/*! @license ©2014 Ruben Verborgh - Multimedia Lab / iMinds / Ghent University */

var MultiTransformIterator = require('../../lib/iterators/MultiTransformIterator');

var Iterator = require('../../lib/iterators/Iterator');

describe('MultiTransformIterator', function () {
  describe('The MultiTransformIterator module', function () {
    it('should make MultiTransformIterator objects', function () {
      MultiTransformIterator().should.be.an.instanceof(MultiTransformIterator);
    });

    it('should be a MultiTransformIterator constructor', function () {
      new MultiTransformIterator().should.be.an.instanceof(MultiTransformIterator);
    });

    it('should make Iterator objects', function () {
      MultiTransformIterator().should.be.an.instanceof(Iterator);
    });

    it('should be an Iterator constructor', function () {
      new MultiTransformIterator().should.be.an.instanceof(Iterator);
    });
  });

  describe('A MultiTransformIterator without source', function () {
    var iterator;
    before(function () {
      iterator = new MultiTransformIterator();
    });

    it('should have ended', function () {
      iterator.ended.should.be.true;
    });
  });

  describe('A MultiTransformIterator with an empty source iterator', function () {
    var iterator;
    before(function () {
      iterator = new MultiTransformIterator([Iterator.empty()]);
    });

    it('should have ended', function () {
      iterator.ended.should.be.true;
    });
  });

  describe('A MultiTransformIterator with a null source iterator', function () {
    var iterator;
    before(function () {
      iterator = new MultiTransformIterator([null]);
    });

    it('should have ended', function () {
      iterator.ended.should.be.true;
    });
  });

  describe('A MultiTransformIterator without _createTransformer', function () {
    var iterator;
    before(function () {
      iterator = new MultiTransformIterator(Iterator.single(1));
    });

    it('should not have ended', function () {
      iterator.ended.should.be.false;
    });

    it('should throw an error on read', function () {
      (function () { iterator.read(); })
        .should.throw('The _createTransformer method has not been implemented.');
    });
  });

  describe('A MultiTransformIterator with a two-element source', function () {
    var iterator, endEventEmitted = 0, options = { 'x': 'y' };
    before(function () {
      var source = new Iterator.fromArray(['a', 'b']);
      var transformerA = new Iterator.fromArray(['a1', 'a2']);
      var transformerB = new Iterator.fromArray(['b1', 'b2', 'b3']);

      iterator = new MultiTransformIterator(source, options);
      iterator.on('end', function () { endEventEmitted++; });

      var create = sinon.stub(iterator, '_createTransformer');
      create.onCall(0).returns(transformerA);
      create.onCall(1).returns(transformerB);
      create.onCall(2).throws('_createTransformer may only be called twice');
    });

    describe('before reading starts', function () {
      it('should not have called _createTransformer', function () {
        iterator._createTransformer.should.not.have.been.called;
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not have emitted the end event', function () {
        endEventEmitted.should.equal(0);
      });
    });

    describe('when reading the first element', function () {
      it('should read the first element from the first transformer', function () {
        expect(iterator.read()).to.deep.equal('a1');
      });

      it('should have called _createTransformer twice', function () {
        iterator._createTransformer.should.have.been.calledTwice;
      });

      it('should have called _createTransformer with the first item and options', function () {
        iterator._createTransformer.should.have.been.calledWith('a', options);
      });

      it('should have called _createTransformer with the second item and options', function () {
        iterator._createTransformer.should.have.been.calledWith('b', options);
      });

      it('should not have ended', function () {
        iterator.ended.should.be.false;
      });

      it('should not have emitted the end event', function () {
        endEventEmitted.should.equal(0);
      });
    });

    describe('when reading the remaining elements', function () {
      it('should read the second element from the first transformer', function () {
        expect(iterator.read()).to.deep.equal('a2');
      });

      it('should read the first element from the second transformer', function () {
        expect(iterator.read()).to.deep.equal('b1');
      });

      it('should read the second element from the second transformer', function () {
        expect(iterator.read()).to.deep.equal('b2');
      });

      it('should read the third element from the second transformer', function () {
        expect(iterator.read()).to.deep.equal('b3');
      });

      it('should have made no more calls to _createTransformer', function () {
        iterator._createTransformer.should.have.been.calledTwice;
      });
    });

    describe('after reading all element', function () {
      it('should not read more elements', function () {
        expect(iterator.read()).to.equal(null);
      });

      it('should have ended', function () {
        iterator.ended.should.be.true;
      });

      it('should have emitted the end event', function () {
        endEventEmitted.should.equal(1);
      });
    });
  });
});