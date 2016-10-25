import { lambda } from 'lambda'

describe('lambda calculus', () => {

  it('should evaluate variable to self', () => {
    expect(lambda.eval('x')).toEqual('x');
  });

  it('should evaluate function to self', () => {
    expect(lambda.eval('(λx.y)')).toEqual('(λx.y)');
  });

  it('should evaluate application', () => {
    expect(lambda.eval('(λx.xx)y')).toEqual('(yy)');
  });

  it('should evaluate several applications', () => {
    expect(lambda.eval('((λx.(xz))(λt.tt))')).toEqual('(zz)');
  });

  it('should evaludate nested applications', () => {
    expect(lambda.eval('((((λx.(λy.(λz.zyx)))u)v)w)')).toEqual('(w(vu))');
  });

  it('normal form still containing applications evaluates to itself', () => {
    expect(lambda.eval('(z(λx.(x(λy.(xy)))))')).toEqual('(z(λx.(x(λy.(xy)))))');
  });

  it('should evaluate body containing functions with bound variables with the same name as free variables', () => {
    expect(lambda.eval('(λx.yx)x')).toEqual('(yx)');
  });
});

//TODO: Add option to generate JavaScript from the parsed lambda expression tree, i.e. compile to JavaScript, not just interpret