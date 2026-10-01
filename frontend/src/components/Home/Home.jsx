import { useEffect } from 'react';
import Categories from '../Layouts/Categories';
import Banner from './Banner/Banner';
import DealSlider from './DealSlider/DealSlider';
import ProductSlider from './ProductSlider/ProductSlider';
import { useDispatch, useSelector } from 'react-redux';
import { clearErrors, getSliderProducts } from '../../actions/productAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';

const Home = () => {
  const dispatch = useDispatch();
  const { enqueueSnackbar } = useSnackbar();
  const { error, loading } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(getSliderProducts());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      dispatch(clearErrors());
    }
  }, [error, dispatch, enqueueSnackbar]);

  return (
    <>
      <MetaData title="Online Shopping Site for Mobiles, Electronics, Furniture, Grocery, Lifestyle, Books & More | Flipkart" />
      <Categories />
      <main className="mx-auto mt-16 flex w-full max-w-[1600px] flex-col gap-3 px-2 sm:mt-2 sm:px-3">
        <Banner />
        <DealSlider title="Deals of the Day" />
        {!loading && <ProductSlider title="Suggested for You" tagline="Handpicked for your next purchase" />}
        <DealSlider title="Top Brands, Best Price" />
        {!loading && <ProductSlider title="Trending Offers" tagline="Popular picks across categories" />}
        <DealSlider title="Top Offers On" />
        {!loading && <ProductSlider title="You May Also Like" tagline="More products worth exploring" />}
      </main>
    </>
  );
};

export default Home;
