import { useDroppable } from "@dnd-kit/react";

function Droppable({ id, children }: { id: any; children: React.ReactNode }) {
  const { ref } = useDroppable({
    id,
  });

  return (
    <div ref={ref} className="flex flex-1 flex-col gap-3 min-h-[160px] sm:min-h-[200px]">
      {children}
    </div>
  );
}

export default Droppable;
