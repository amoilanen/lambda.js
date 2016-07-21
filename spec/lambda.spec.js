import lambda from './lib/lambda'

describe('lambda calculus', () => {

  it('should be defined', () => {
    expect(lambda).toBeDefined();
  });

  describe('variable', () => {

    it('should evaluate to self', () => {
      expect(lambda.eval('x')).toEqual('x');
    });
  });

  describe('function', () => {

    it('should evaluate to self', () => {
      expect(lambda.eval('(λx.y)')).toEqual('(λx.y)');
    });
  });

  describe('application', () => {

    it('should evaluate', () => {
      expect(lambda.eval('(λx.xx)1')).toEqual('11');
    });

    xdescribe('several applications', () => {
    });

    xdescribe('nested applications', () => {
    });

    xdescribe('normal form still contains applications', () => {
    });

    xdescribe('body contains functions with bound variables with the same name', () => {
    });
  });

  //TODO: Several letter variables like abc?
  //TODO: Do not require parenthesis, set them up automatically
});