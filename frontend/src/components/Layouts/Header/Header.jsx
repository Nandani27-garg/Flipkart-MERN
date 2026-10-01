import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Searchbar from './Searchbar';
import logo from '../../../assets/images/logo.png';
import PrimaryDropDownMenu from './PrimaryDropDownMenu';
import SecondaryDropDownMenu from './SecondaryDropDownMenu';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const Header = () => {
  const { isAuthenticated, user } = useSelector((state) => state.user);
  const { cartItems = [] } = useSelector((state) => state.cart);
  const [togglePrimaryDropDown, setTogglePrimaryDropDown] = useState(false);
  const [toggleSecondaryDropDown, setToggleSecondaryDropDown] = useState(false);

  return (
    <header className="fixed top-0 z-50 w-full bg-[#2874f0] shadow-md">
      <div className="mx-auto flex min-h-[56px] w-full max-w-[1248px] items-center gap-3 px-3 py-2 sm:px-5 lg:gap-8">
        <Link to="/" aria-label="Flipkart home" className="flex shrink-0 flex-col items-start justify-center">
          <img draggable="false" className="h-[20px] w-[82px] object-contain" src={logo} alt="Flipkart" />
          <span className="ml-1 mt-[-1px] text-[10px] italic leading-3 text-white">Explore <span className="font-semibold text-[#ffe500]">Plus ✦</span></span>
        </Link>

        <div className="min-w-0 flex-1">
          <Searchbar />
        </div>

        <nav className="flex shrink-0 items-center gap-3 text-sm font-medium text-white sm:gap-6">
          {isAuthenticated === false ? (
            <Link to="/login" className="rounded-sm bg-white px-5 py-1.5 font-semibold text-[#2874f0] shadow-sm transition hover:bg-gray-100 sm:px-8">Login</Link>
          ) : (
            <div className="relative">
              <button type="button" aria-expanded={togglePrimaryDropDown} onClick={() => setTogglePrimaryDropDown(!togglePrimaryDropDown)} className="flex max-w-[110px] items-center gap-1 whitespace-nowrap hover:text-blue-100">
                <span className="max-w-[82px] truncate">{user?.name?.split(" ")[0] || "Account"}</span>
                {togglePrimaryDropDown ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
              </button>
              {togglePrimaryDropDown && <PrimaryDropDownMenu setTogglePrimaryDropDown={setTogglePrimaryDropDown} user={user} />}
            </div>
          )}

          <Link to="/login" className="hidden whitespace-nowrap transition hover:text-blue-100 lg:block">Become a Seller</Link>

          <div className="relative hidden sm:block">
            <button type="button" aria-expanded={toggleSecondaryDropDown} onClick={() => setToggleSecondaryDropDown(!toggleSecondaryDropDown)} className="flex items-center gap-1 whitespace-nowrap hover:text-blue-100">
              More {toggleSecondaryDropDown ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
            </button>
            {toggleSecondaryDropDown && <SecondaryDropDownMenu />}
          </div>

          <Link to="/cart" aria-label={`Shopping cart, ${cartItems.length} items`} className="relative flex items-center gap-1.5 whitespace-nowrap transition hover:text-blue-100">
            <span className="relative inline-flex">
              <ShoppingCartIcon />
              {cartItems.length > 0 && <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border border-[#2874f0] bg-[#ff6161] px-1 text-[10px] text-white">{cartItems.length}</span>}
            </span>
            <span className="hidden sm:inline">Cart</span>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
