import { Card } from 'components/ui/card';
import { Skeleton } from 'components/ui/skeleton';
import { Fragment, useMemo } from 'react';

const getWidth = (baseWidth: number, variance: number) =>
  baseWidth + (2 * variance * Math.random() - variance);

export const QuestionSkeleton = () => {
  const questionWidth = useMemo(() => getWidth(65, 10), []);
  const answersWidths = useMemo(
    () => Array.from({ length: 4 }).map(() => getWidth(65, 10)),
    [],
  );

  return (
    <Card>
      <header className="p-4">
        <Skeleton
          className="h-5 my-0.5"
          style={{ width: `${questionWidth}%` }}
        />
      </header>
      {answersWidths.map((width, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <Fragment key={i}>
          <div className="w-full border-b" />
          <SkeletonAnswer width={width} />
        </Fragment>
      ))}
    </Card>
  );
};

interface SkeletonAnswerProps {
  width: number;
}
const SkeletonAnswer = ({ width }: SkeletonAnswerProps) => (
  <div className="px-4 py-1 flex items-center justify-between">
    <Skeleton className="h-4" style={{ width: `${width}%` }} />
    <div className="flex h-8 w-8 items-center justify-center">
      <Skeleton className="h-4 w-4 rounded-sm" />
    </div>
  </div>
);