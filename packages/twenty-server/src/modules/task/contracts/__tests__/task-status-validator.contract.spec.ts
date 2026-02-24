import fs from 'node:fs';
import path from 'node:path';

describe('TaskStatusValidator contract', () => {
  it('should define a validator contract that accepts currentStatus/newStatus and returns boolean', () => {
    const contractPath = path.resolve(
      __dirname,
      '..',
      'task-status-validator.contract.ts',
    );

    const contractSource = fs.existsSync(contractPath)
      ? fs.readFileSync(contractPath, 'utf8')
      : '';

    expect(contractSource).toContain('interface TaskStatusValidator');
    expect(contractSource).toMatch(
      /validateStatusTransition\s*\(\s*currentStatus\s*:\s*TaskStatus\s*,\s*newStatus\s*:\s*TaskStatus\s*\)\s*:\s*boolean/,
    );
  });
});
