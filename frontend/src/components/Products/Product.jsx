import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import { Link } from 'react-router-dom';
import { getDiscount } from '../../utils/functions';
import { useDispatch, useSelector } from 'react-redux';
import { addToWishlist, removeFromWishlist } from '../../actions/wishlistAction';
import { useSnackbar } from 'notistack';

const Product = ({ _id, name = 'Product', images = [], ratings = 0, numOfReviews = 0, price = 0, cuttedPrice = 0 }) => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { wishlistItems = [] } = useSelector((state) => state.wishlist);
  const itemInWishlist = wishlistItems.some((item) => item.product === _id);
  const imageUrl = images?.[0]?.url;

  const addToWishlistHandler = () => {
    if (itemInWishlist) {
      dispatch(removeFromWishlist(_id));
      enqueueSnackbar('Removed from wishlist', { variant: 'success' });
    } else {
      dispatch(addToWishlist(_id));
      enqueueSnackbar('Added to wishlist', { variant: 'success' });
    }
  };

  return (
    <article className="group relative flex min-w-0 flex-col rounded-sm border-r border-b border-gray-100 bg-white px-3 py-5 transition duration-200 hover:z-[1] hover:shadow-[0_4px_18px_rgba(0,0,0,0.12)] sm:px-4">
      <button
        type="button"
        onClick={addToWishlistHandler}
        aria-label={itemInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        className={`absolute right-3 top-3 z-[2] flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-110 ${itemInWishlist ? 'text-red-500' : 'text-gray-300 hover:text-red-500'}`}
      >
        <FavoriteIcon sx={{ fontSize: 19 }} />
      </button>

      <Link to={`/product/${_id}`} className="flex min-w-0 flex-col text-left">
        <div className="flex h-40 w-full items-center justify-center overflow-hidden sm:h-48">
          {imageUrl ? (
            <img
              draggable="false"
              loading="lazy"
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.04]"
              src={imageUrl}
              alt={name}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50 text-xs text-gray-400">Image unavailable</div>
          )}
        </div>
        <h2 className="mt-4 min-h-10 w-full text-sm leading-5 text-gray-800 transition group-hover:text-[#2874f0]">
          {name.length > 85 ? `${name.substring(0, 85)}…` : name}
        </h2>
      </Link>

      <div className="mt-2 flex flex-col items-start gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="inline-flex items-center gap-0.5 rounded-sm bg-[#388e3c] px-1.5 py-0.5 font-semibold text-white">
            {Number(ratings || 0).toFixed(1)} <StarIcon sx={{ fontSize: 12 }} />
          </span>
          <span>({numOfReviews || 0})</span>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="text-base font-semibold text-gray-900">₹{Number(price || 0).toLocaleString('en-IN')}</span>
          {Number(cuttedPrice) > Number(price) && (
            <>
              <span className="text-xs text-gray-500 line-through">₹{Number(cuttedPrice).toLocaleString('en-IN')}</span>
              <span className="text-xs font-medium text-[#388e3c]">{getDiscount(price, cuttedPrice)}% off</span>
            </>
          )}
        </div>
        <span className="text-xs text-[#388e3c]">Free delivery</span>
      </div>
    </article>
  );
};

export default Product;
