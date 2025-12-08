 import { Alert } from "react-bootstrap"
const Message = ({ varient , children}) => {
  return (
    <div>
       <Alert variant={varient}> { children }  </Alert>
    </div>
  )
}


Message.defaultProps ={
    varient : 'info'
};
export default Message