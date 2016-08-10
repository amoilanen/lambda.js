import { lambda } from './lib/lambda'

describe('lambda calculus', () => {

  it('should evaluate variable to self', () => {
    expect(lambda.eval('x')).toEqual('x');
  });

  it('should evaluate function to self', () => {
    expect(lambda.eval('(λx.y)')).toEqual('(λx.y)');
  });

  it('should evaluate application', () => {
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

  //(λx.(λy.(λz.zyx))123 -> 321
});

//TODO: Add option to generate JavaScript from the parsed lambda expression tree, i.e. compile to JavaScript, not just interpret