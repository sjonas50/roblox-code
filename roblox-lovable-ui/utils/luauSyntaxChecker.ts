export interface SyntaxError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: SyntaxError[];
  fixedCode?: string;
}

/**
 * Validates Luau code syntax and returns any errors found
 * This is a browser-compatible version that doesn't require luaparse
 */
export function validateLuauSyntax(code: string): ValidationResult {
  const errors: SyntaxError[] = [];
  
  // Do Luau-specific checks
  const luauErrors = checkLuauSpecificSyntax(code);
  errors.push(...luauErrors);
  
  // Check for unbalanced blocks
  const blockErrors = checkUnbalancedBlocks(code);
  errors.push(...blockErrors);
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Checks for Luau-specific syntax issues
 */
function checkLuauSpecificSyntax(code: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = code.split('\n');
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    
    // Check for missing 'then' in if statements (including elseif)
    if ((/\bif\s+[^\n]+$/.test(line) || /\belseif\s+[^\n]+$/.test(line)) && !/\bthen\b/.test(line)) {
      // Skip comments
      if (!line.trim().startsWith('--')) {
        errors.push({
          line: lineNum,
          column: line.length,
          message: "Missing 'then' in if/elseif statement",
          severity: 'error',
          suggestion: 'Add "then" after the condition'
        });
      }
    }
    
    // Check for == in local variable declarations
    if (/\blocal\s+\w+\s*==/.test(line)) {
      const match = line.match(/\blocal\s+\w+\s*==/);
      errors.push({
        line: lineNum,
        column: match ? match.index! + match[0].indexOf('==') + 1 : 1,
        message: "Using '==' instead of '=' for assignment",
        severity: 'error',
        suggestion: 'Use single "=" for assignment'
      });
    }
    
    // Check for incorrect string concatenation
    if (/["'][^"']*["']\s*\+\s*["']/.test(line)) {
      const match = line.match(/\+/);
      errors.push({
        line: lineNum,
        column: match ? match.index! + 1 : 1,
        message: "Using '+' for string concatenation",
        severity: 'error',
        suggestion: 'Use ".." for string concatenation'
      });
    }
    
    // Check for missing spaces around ..
    if (/\w\.\./.test(line) || /\.\.\w/.test(line)) {
      errors.push({
        line: lineNum,
        column: line.search(/\w\.\.|\.\.w/) + 1,
        message: "Missing space around '..' operator",
        severity: 'warning',
        suggestion: 'Add spaces around ".." for clarity'
      });
    }
    
    // Check for chained comparisons
    if (/\d+\s*[<>]=?\s*\w+\s*[<>]=?\s*\d+/.test(line)) {
      errors.push({
        line: lineNum,
        column: 1,
        message: "Chained comparison detected",
        severity: 'error',
        suggestion: 'Use "and" between comparisons (e.g., "1 <= x and x <= 3")'
      });
    }
  });
  
  return errors;
}

/**
 * Checks for unbalanced blocks (missing end keywords)
 */
function checkUnbalancedBlocks(code: string): SyntaxError[] {
  const errors: SyntaxError[] = [];
  const lines = code.split('\n');
  
  const blockStarters = /\b(function|if|for|while|repeat|do)\b/;
  const blockEnder = /\bend\b/;
  const thenKeyword = /\bthen\b/;
  const elseKeyword = /\belse\b/;
  const elseifKeyword = /\belseif\b/;
  
  let blockDepth = 0;
  let expectingEnd: { type: string; line: number }[] = [];
  
  lines.forEach((line, index) => {
    const lineNum = index + 1;
    const trimmedLine = line.trim();
    
    // Skip comments
    if (trimmedLine.startsWith('--')) return;
    
    // Check for block starters
    const starterMatch = trimmedLine.match(blockStarters);
    if (starterMatch) {
      const blockType = starterMatch[1];
      
      // Special handling for if statements
      if (blockType === 'if') {
        if (!thenKeyword.test(line)) {
          // This error is already caught in checkLuauSpecificSyntax
          return;
        }
      }
      
      blockDepth++;
      expectingEnd.push({ type: blockType, line: lineNum });
    }
    
    // Check for else/elseif (doesn't increase block depth)
    if (elseKeyword.test(trimmedLine) || elseifKeyword.test(trimmedLine)) {
      // These are part of the if block, don't increase depth
    }
    
    // Check for block enders
    if (blockEnder.test(trimmedLine)) {
      blockDepth--;
      expectingEnd.pop();
      
      if (blockDepth < 0) {
        errors.push({
          line: lineNum,
          column: 1,
          message: "Extra 'end' keyword",
          severity: 'error',
          suggestion: 'Remove this "end" or add a missing block starter'
        });
        blockDepth = 0; // Reset to prevent cascading errors
      }
    }
  });
  
  // Check if there are unclosed blocks
  if (blockDepth > 0) {
    expectingEnd.forEach(block => {
      errors.push({
        line: block.line,
        column: 1,
        message: `Missing 'end' for ${block.type} block started here`,
        severity: 'error',
        suggestion: `Add "end" to close the ${block.type} block`
      });
    });
  }
  
  return errors;
}

/**
 * Gets suggestions for common error messages
 */
function getSuggestionForError(errorMessage: string): string | undefined {
  const suggestions: { [key: string]: string } = {
    'expected near': 'Check for missing keywords like "then", "do", or "end"',
    'unexpected symbol': 'Check for typos or incorrect operators',
    'unfinished string': 'Check for missing closing quote',
    'malformed number': 'Check number format (use "." for decimals, not ",")',
    'unexpected end': 'You might have an extra "end" keyword'
  };
  
  for (const [pattern, suggestion] of Object.entries(suggestions)) {
    if (errorMessage.toLowerCase().includes(pattern)) {
      return suggestion;
    }
  }
  
  return undefined;
}

/**
 * Attempts to automatically fix common syntax errors
 */
export function autoFixLuauSyntax(code: string): ValidationResult {
  let fixedCode = code;
  const fixes: string[] = [];
  
  // Fix 1: Add missing 'then' to if/elseif statements
  fixedCode = fixedCode.replace(/\b((?:else)?if\s+[^\n]+?)(\s*)(--[^\n]*)?\s*$/gm, (match, condition, whitespace, comment) => {
    if (!condition.includes('then')) {
      fixes.push('Added missing "then" to if/elseif statement');
      return condition + ' then' + whitespace + (comment || '');
    }
    return match;
  });
  
  // Fix 2: Replace == with = in local assignments
  const oldCode2 = fixedCode;
  fixedCode = fixedCode.replace(/\b(local\s+\w+\s*)==/gm, '$1=');
  if (oldCode2 !== fixedCode) {
    fixes.push('Fixed assignment operator (== to =)');
  }
  
  // Fix 3: Replace + with .. for string concatenation
  const oldCode3 = fixedCode;
  fixedCode = fixedCode.replace(/(["'][^"']*["'])\s*\+\s*(["'][^"']*["'])/g, '$1 .. $2');
  if (oldCode3 !== fixedCode) {
    fixes.push('Fixed string concatenation (+ to ..)');
  }
  
  // Fix 4: Add spaces around .. operator
  fixedCode = fixedCode.replace(/(\w)(\.\.)(\w)/g, '$1 .. $3');
  
  // Fix 5: Fix chained comparisons
  const oldCode5 = fixedCode;
  fixedCode = fixedCode.replace(/(\d+\s*[<>]=?\s*)(\w+)(\s*[<>]=?\s*\d+)/g, '$1$2 and $2$3');
  if (oldCode5 !== fixedCode) {
    fixes.push('Fixed chained comparison');
  }
  
  // Fix 6: Balance end keywords
  const balanced = balanceEndKeywords(fixedCode);
  if (balanced.fixed) {
    fixedCode = balanced.code;
    fixes.push(balanced.message);
  }
  
  // Validate the fixed code
  const validation = validateLuauSyntax(fixedCode);
  
  return {
    isValid: validation.isValid,
    errors: validation.errors,
    fixedCode: fixedCode !== code ? fixedCode : undefined
  };
}

/**
 * Attempts to balance end keywords in the code
 */
function balanceEndKeywords(code: string): { code: string; fixed: boolean; message: string } {
  const lines = code.split('\n');
  const blockStarters = /\b(function|if|for|while|repeat|do)\b/;
  const blockEnder = /\bend\b/;
  const thenKeyword = /\bthen\b/;
  
  let blockDepth = 0;
  let blockTypes: string[] = [];
  
  // First pass: count blocks
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith('--')) return;
    
    const starterMatch = trimmedLine.match(blockStarters);
    if (starterMatch) {
      const blockType = starterMatch[1];
      if (blockType === 'if' && !thenKeyword.test(line)) {
        return; // Skip malformed if statements
      }
      blockDepth++;
      blockTypes.push(blockType);
    }
    
    if (blockEnder.test(trimmedLine)) {
      blockDepth--;
      blockTypes.pop();
    }
  });
  
  // Add missing ends
  if (blockDepth > 0) {
    const missingEnds = '\n' + 'end\n'.repeat(blockDepth);
    return {
      code: code + missingEnds,
      fixed: true,
      message: `Added ${blockDepth} missing "end" keyword(s)`
    };
  }
  
  // Remove extra ends
  if (blockDepth < 0) {
    let extraEnds = Math.abs(blockDepth);
    const reversedLines = [...lines].reverse();
    const indicesToRemove: number[] = [];
    
    for (let i = 0; i < reversedLines.length && extraEnds > 0; i++) {
      if (blockEnder.test(reversedLines[i])) {
        indicesToRemove.push(lines.length - 1 - i);
        extraEnds--;
      }
    }
    
    const filteredLines = lines.filter((_, index) => !indicesToRemove.includes(index));
    return {
      code: filteredLines.join('\n'),
      fixed: true,
      message: `Removed ${Math.abs(blockDepth)} extra "end" keyword(s)`
    };
  }
  
  return { code, fixed: false, message: '' };
}

/**
 * Formats error messages for display
 */
export function formatSyntaxError(error: SyntaxError, code: string): string {
  const lines = code.split('\n');
  const errorLine = lines[error.line - 1] || '';
  
  let message = `Line ${error.line}: ${error.message}`;
  if (error.suggestion) {
    message += `\n  Suggestion: ${error.suggestion}`;
  }
  
  // Add the problematic line with an indicator
  if (errorLine) {
    message += `\n  ${errorLine}`;
    if (error.column > 0) {
      message += `\n  ${' '.repeat(error.column - 1)}^`;
    }
  }
  
  return message;
}