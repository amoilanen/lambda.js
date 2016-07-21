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
});