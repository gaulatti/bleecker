import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {parse} from 'yaml';
import {assertBaseReconciliation, assertBoundedVerificationWait, assertFrozenWorkflow, assertReassessmentOnVerification} from '../../.clouseau-ci/test/automatic-upgrade-contract.mjs';
import {evaluate, allowed} from './workflow-expressions.mjs';
const workflow = parse(readFileSync(new URL('../workflows/ci.yml', import.meta.url), 'utf8'));

test('actual consumer job expressions freeze one authorized SHA and digest across a central advance and use newer main next run', () => {
  assertFrozenWorkflow(workflow, evaluate);
  const trust = JSON.parse(readFileSync(new URL('../clouseau.json', import.meta.url))).local_review;
  assert.deepEqual(trust.central_source, {repository: 'gaulatti/clouseau', ref: 'refs/heads/main'});
  assert.equal(trust.reviewer_digest, undefined);
  assert.ok(trust.keys.length > 0);
});

test('resolution failure cannot turn required PR approval into a skipped passing check', () => {
  const gate = workflow.jobs['approve-and-merge'];
  assert.equal(gate.if, 'always()');
  for (const result of ['failure', 'cancelled', 'skipped']) {
    const context = {github: {event_name: 'pull_request_target', event: {pull_request: {draft: false}}},
      needs: {'assess-intent': {result}, 'resolve-clouseau': {result, outputs: {}}}};
    assert.equal(evaluate(gate.name, context).coerceString(), 'approve-and-merge');
    assert.equal(allowed(gate.steps[0].if, context), true);
    assert.equal(gate.steps[0].run, 'exit 1');
    assert.equal(allowed(gate.steps.at(-1).if, context, {success: false}), false);
  }
});

test('shared tests install dependencies from this run frozen engine before executing', () => {
  const steps = workflow.jobs.unit.steps;
  const checkout = steps.findIndex(step => step.with?.repository === 'gaulatti/clouseau');
  const setup = steps.findIndex(step => step.name === 'Set up Python for frozen shared tests');
  const install = steps.findIndex(step => step.name === 'Install frozen shared test dependencies');
  const test = steps.findIndex(step => step.name === 'Test approval policy');
  assert.equal(steps[setup].uses, 'actions/setup-python@v5');
  assert.equal(steps[setup].with['python-version'], '3.13');
  assert.equal(steps[install].run, 'python3 -m pip install --disable-pip-version-check -r .clouseau-ci/requirements-test.txt');
  assert.ok(checkout < setup && setup < install && install < test);
});

test('review waits through the engine operation, reassesses on verification completion and reconciles the base', () => {
  assert.equal(assertBoundedVerificationWait(workflow), 1);
  assert.equal(assertReassessmentOnVerification(workflow), 1);
  assert.equal(assertBaseReconciliation(workflow), 1);
  assert.deepEqual(workflow.on.workflow_run.workflows, [workflow.name]);
  const config = JSON.parse(readFileSync(new URL('../clouseau.json', import.meta.url)));
  assert.equal(config.local_review.max_age_seconds, 172800);
  assert.equal(JSON.stringify(workflow).includes('update-token'), false);
});

test('a review that ended pending has no record and cannot approve, merge or repair', () => {
  const pending = {github: {event_name: 'pull_request_target', event: {pull_request: {draft: false}}},
    needs: {'assess-intent': {result: 'success', outputs: {assessment: ''}}, 'resolve-clouseau': {result: 'success', outputs: {}}}};
  const gate = workflow.jobs['approve-and-merge'];
  assert.equal(allowed(gate.steps[0].if, pending), true);
  assert.equal(gate.steps[0].run, 'exit 1');
  assert.equal(allowed(workflow.jobs['apply-repair'].if, {...pending, needs: {...pending.needs, 'approve-and-merge': {result: 'failure'}}}), false);
});
