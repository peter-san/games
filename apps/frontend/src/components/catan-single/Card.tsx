
import { Resource } from './model/Resource';

function Card({...props}: {type: Resource, value: number, onClick?: any} & any) {

  return (
    <div className={'card ' + props.type +' '+ props.className} onClick={props.onClick}>
        <div className="indicator">{props.value}</div>
        {props.children}
    </div>
  );
}

export default Card;
