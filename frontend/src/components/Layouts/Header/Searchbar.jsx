import SearchIcon from '@mui/icons-material/Search';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Searchbar = () => {
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = keyword.trim();
    navigate(query ? `/products/${encodeURIComponent(query)}` : '/products');
  };

  return (
    <form onSubmit={handleSubmit} role="search" className="flex w-full items-center overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-blue-200">
      <input
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent px-3 py-2 text-sm text-gray-800 outline-none placeholder:text-gray-500 sm:px-4"
        type="search"
        aria-label="Search for products, brands and more"
        placeholder="Search for products, brands and more"
      />
      <button type="submit" aria-label="Search" className="flex h-9 w-11 shrink-0 items-center justify-center text-[#2874f0] transition hover:bg-blue-50">
        <SearchIcon />
      </button>
    </form>
  );
};

export default Searchbar;
