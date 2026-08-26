import {useDroppable} from '@dnd-kit/react';

function Droppable({id, children}:{id:any,children:React.ReactNode}) {
  const {ref} = useDroppable({
    id,
  });

  return (
    <div ref={ref} style={{width: 300, height: 300}}>
      {children}
    </div>
  );
}

export default Droppable