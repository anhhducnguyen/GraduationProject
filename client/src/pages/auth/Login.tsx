import React, { Component } from 'react';
import axios from 'axios';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { AuthContext, TOKEN_KEY } from '../../AuthContext';

interface LoginState {
  email: string;
  password: string;
  error: string;
}

class LoginForm extends Component<{ navigate: NavigateFunction }, LoginState> {
  static contextType = AuthContext;
  declare context: React.ContextType<typeof AuthContext>;

  constructor(props: any) {
    super(props);
    this.state = {
      email: '',
      password: '',
      error: '',
    };
  }

  handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ [e.target.name]: e.target.value } as any);
  };

  handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { email, password } = this.state;

    try {
      console.log("🔐 Submitting login...");
      const response = await axios.post('http://localhost:5000/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      console.log("✅ Login success:", user);

      // Lưu token & user
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem('user', JSON.stringify(user));

      // Cập nhật AuthContext
      this.context!.login();

      // Chuyển về trang chủ
      this.props.navigate('/');
    } catch (err: any) {
      console.error("❌ Login error:", err);
      this.setState({
        error: err.response?.data?.message || 'Không thể kết nối đến máy chủ.',
      });
    }
  };

  render() {
    const { email, password, error } = this.state;

    return (
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            <img className="w-8 h-8 mr-2" src="https://flowbite.s3.amazonaws.com/blocks/marketing-ui/logo.svg" alt="logo" />
            Flowbite
          </a>
          <div className="w-full bg-white rounded-lg shadow dark:border sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Sign in to your account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={this.handleSubmit}>
                {error && <p className="text-red-500 text-sm">{error}</p>}

                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={email}
                    onChange={this.handleChange}
                    required
                    className="input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={password}
                    onChange={this.handleChange}
                    required
                    className="input bg-gray-50 border border-gray-300 text-gray-900 rounded-lg w-full p-2.5"
                  />
                </div>
                <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5">
                  Sign in
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    );
  }
}

// Wrapper dùng hook để truyền navigate vào class component
function LoginWrapper() {
  const navigate = useNavigate();
  return <LoginForm navigate={navigate} />;
}

export default LoginWrapper;
