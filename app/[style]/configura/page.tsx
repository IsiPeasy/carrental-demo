import { Suspense } from 'react';
import BuilderView from './BuilderView';

export default function BuilderPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh]" />}>
      <BuilderView />
    </Suspense>
  );
}
