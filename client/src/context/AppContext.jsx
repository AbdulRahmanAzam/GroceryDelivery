import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {toast} from "react-hot-toast";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();

const AppContextProvider = ({children}) => {
    const currency = import.meta.env.VITE_CURRENCY || '$';

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isSeller, setIsSeller] = useState(false);
    const [showUserLogin, setShowUserLogin] = useState(false);
    const [products, setProducts] = useState([]);

    const [cartItems, setCartItems] = useState({});
    const [searchQuery, setSearchQuery] = useState({});

    // Fetch seller status
    const fetchSeller = async () => {
        try {
            const {data} = await axios.get("/api/seller/is-auth");
            if(data.success){
                setIsSeller(true);
            }else{
                setIsSeller(false);
            }

        } catch (error) {
            setIsSeller(false);
            console.log("fetch seller: ", error.message);
        }
    }

    // fetch user auth status, user data and cart items
    const fetchUser = async ()=> {
        try {
            const { data } = await axios.get("/api/user/is-auth");
            if(data.success){
                setUser(data.user)
                setCartItems(data.user.cartItems);
            }


        } catch (error) {
            toast.error(error.message);
        }
    }

    // Add item to cart
    const addToCart = (itemId) => {
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId] += 1;
        }else{
            cartData[itemId] = 1;
        }
        console.log("Item added");
        toast.success('Item added to cart');
        setCartItems(cartData);
    }

    // Update Cart Item Quantity
    const updateCartItem = (itemId, quantity) => {
        let cartData = structuredClone(cartItems);
        cartData[itemId] = quantity;
        setCartItems(cartData);
        toast.success('Cart updated successfully');
    }

    // Remove Item from Cart
    const RemoveFromCart = (itemId) => {
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId] -= 1;
            if(cartData[itemId] === 0){
                delete cartData[itemId];
            }
        }
        setCartItems(cartData);
        toast.success('Item removed from cart');
    }

    // Fetch All products
    const fetchProducts = async () => {
        try {
            const {data} = await axios.get("/api/product/list");
            if(data.success){
                setProducts(data.products);
            }else{
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    }
    
    useEffect(() => {
        fetchUser();
        fetchSeller();
        fetchProducts();
    }, [])
 
    // Update Database Cart Items;
    useEffect(() => {
        const updateCart = async () => {
            try {
                const { data } = await axios.post("/api/cart/update", {cartItems});
                if(!data.success){
                    toast.error(data.message);
                }
            } catch (error) {  
               toast.error(error.message); 
            }
        }

        if(user){
            updateCart();
        }

    }, [cartItems]);


    // GET CART ITEM COUNT
    const getCartItemCount = () => {
        let totalCount = 0;
        for(const item in cartItems){
            totalCount+= cartItems[item];
        }
        return totalCount;
    }

    //  GET CART TOTAL AMOUNT  
    const getCartAmount = () => {
        let totalAmount = 0;
        for(const item in cartItems){
            let itemInfo = products.find((product) => product._id === item);
            if(cartItems[item] > 0){
                totalAmount += itemInfo.offerPrice * cartItems[item];
            }
        }
        return Math.floor(totalAmount * 100) / 100;
    }
    
    const value = {
        navigate,
        user, setUser,
        isSeller, setIsSeller,
        showUserLogin, setShowUserLogin,
        searchQuery, setSearchQuery,
        products, currency, addToCart, updateCartItem, RemoveFromCart, cartItems,
        getCartItemCount, getCartAmount,
        axios, fetchProducts, setCartItems
    };

    return <AppContext.Provider value={value}>
        {children}
    </AppContext.Provider>
}

export { AppContext, AppContextProvider };