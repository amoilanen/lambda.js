import { Parser, Variable, Func, Application } from './lib/lambda'

describe('parser', () => {

  let parser;

  beforeEach(() => {
    parser = new Parser();
  });

  it('should parse variable', () => {
    expect(parser.parse('x')).toEqual(new Variable('x'));
  });

  it('should parse function', () => {
    expect(parser.parse('λx.x')).toEqual(new Func('x', new Variable('x')));
  });

  it('should parse application', () => {
    expect(parser.parse('xy')).toEqual(new Application(new Variable('x'), new Variable('y')));
  });

  //TODO: Should support parenthesis, nested excessive parenthesis
  //TODO: Empty expression
  //TODO: Handling errors, like incomplete expression like 'λ'

  //(λx.(λy.(λz.zyx))
  xit('should parse nested functions 1', () => {
    
  });

  //(λx.x(λy.yxz))
  xit('should parse nested expression 2', () => {
    
  });

  //λf.(λx.f(xx))(λx.f(xx))
  xit('should parse Y combinator', () => {
    
  });

  //TODO: Several letter variables like abc?
  //TODO: Do not require parenthesis, set them up automatically
});