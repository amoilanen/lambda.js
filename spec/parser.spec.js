import { parser } from './lib/lambda'

describe('parser', () => {

  it('should parse variable', () => {
    expect(parser).toBeDefined();
  });

  xit('should parse function', () => {
    
  });

  xit('should parse application', () => {
    
  });

  xit('should parse nested functions', () => {
    
  });

  xit('should parse nested expression', () => {
    
  });

  //TODO: Several letter variables like abc?
  //TODO: Do not require parenthesis, set them up automatically
});