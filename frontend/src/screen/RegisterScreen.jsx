import { useState  , useEffect} from 'react';
import { Link , useNavigate , useLocation } from 'react-router-dom';
import { Form , Row , Button , Col }  from 'react-bootstrap';
import FormContainer from '../component/FormContainer';
import Loader from '../component/Loader';
import { useRegisterMutation } from '../slices/userApiSlice';
import { setCredentials } from '../slices/authSlice';
import { useDispatch , useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const RegisterScreen = () => {
 const [ name , setName] = useState('');
 const [ email , setEmail] = useState('');

 const [password , setPassword ] = useState ('');
 const [ confirmPassword , setConfirmPassword] = useState('');


 const dispatch = useDispatch();
 const navigate =  useNavigate();

 const [ register , {isLoading} ] =useRegisterMutation();

 const { userInfo } = useSelector( (state) => state.auth );

const { search } = useLocation ();
const sp =  new URLSearchParams (search);
const redirect =  sp.get('redirect') || '/profile';


useEffect(()=>{
  if(userInfo)
  {
       navigate(redirect);
  }
} , [userInfo , redirect ,navigate ]);




  const submitHandler =  async (e) =>
  {
    e.preventDefault();

    if ( password !== confirmPassword ) {
      toast.error('Password Do Not Match ');
      return ; 
      
    }else{
         try {
       const res = await register ( { name , email , password }).unwrap();
       dispatch(setCredentials({...res,}));
       navigate(redirect);
    } catch (err) {
      toast.error( err?.data?.message || err.error );
    }
    }
  }

  return (
    <FormContainer>
       <h1> Sign Up </h1>
       <Form onSubmit={submitHandler}>
        <Form.Group controlId='name' className='my-3'>
            <Form.Label>Name</Form.Label>
            <Form.Control
            type='text'
            placeholder='Enter Name'
            value={name}
            onChange={(e) => setName(e.target.value)}
            >

            </Form.Control>

        </Form.Group>
        <Form.Group controlId='email' className='my-3'>
            <Form.Label> Email Address</Form.Label>
            <Form.Control
            type='email'
            placeholder='Enter Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            >

            </Form.Control>

        </Form.Group>
        <Form.Group controlId='password' className='my-3'>
            <Form.Label> Password</Form.Label>
            <Form.Control
            type='password'
            placeholder='Enter Password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            >
                
            </Form.Control>

        </Form.Group>
            <Form.Group controlId='confirmPassword' className='my-3'>
            <Form.Label> ConfirmPassword</Form.Label>
            <Form.Control
            type='password'
            placeholder='Enter Password Again'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            >
                
            </Form.Control>

        </Form.Group>
        <Button type='submit'  variant='primary' className='mt-2' > Register </Button>
        { isLoading && <Loader/> }
       </Form>
       <Row className='py-3'>
        <Col>
        Already Have An Account ? < Link to= { redirect ? `/login?redirect=${redirect}` : '/login'}>Login</Link>
        </Col>
       </Row>
    </FormContainer>
  )
}

export default RegisterScreen ; 