import React, { useEffect, useState } from 'react';
import './Header.scss';
import { Link, useHistory } from 'react-router-dom';

interface MenuItem{
    path: string
    title: string
}

const Header = ({siteTitle, authentication,handleLogout,menuList}:{
    siteTitle:string,
    authentication: {email:string, accessToken?: string}
    menuList: MenuItem[],
    handleLogout: ()=>void
}) => {
    const history = useHistory();
    const currPath = history.location.pathname;
    const [menuSelect, setMenuSelect] = useState(siteTitle);
    const { email, accessToken } = authentication;
    console.log(authentication);

    useEffect(() => {
        for (let item of menuList) {
            console.log(item.path);
            console.log(currPath);
            if (item.path === currPath) setMenuSelect(item.title);
        }
    }, [currPath]);

    const handleMenuChange = (info: MenuItem,history:any) => {
        if (currPath === info.path) return;
        history.push(info.path);
        for (let item of menuList) {
            if (item.path === info.path){
                setMenuSelect(item.title);
            }
        }
        return false;
    };

    return (
        <nav className="navbar navbar-expand-md navbar-dark bg-dark shadow-sm" style={{background: '#000000'}}>
            <div className="container-xl small-margin">
                <Link to="/" className="navbar-brand">
                    {siteTitle}
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse"
                        data-bs-target="#navbarToggleExternalContent" aria-controls="navbarToggleExternalContent"
                        aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarToggleExternalContent">
                    {/* Left Side Of Navbar */}
                    <ul className="navbar-nav">
                        {menuList.map((menuItem)=>{
                            return <li className={`nav-item${(menuItem.title==menuSelect)?' active':''}`} key={menuItem.path}>
                                <a className='nav-link' onClick={(event)=>{
                                    event.preventDefault();
                                    handleMenuChange(menuItem, history)
                                }} >
                                    {menuItem.title}
                                </a>
                            </li>;
                        })}
                    </ul>

                    {/**Right Side Of Navbar **/}
                    {authentication.accessToken!='' &&(
                        <ul className="navbar-nav ms-auto">
                            {/** Authentication Links **/}
                            <li className="nav-item dropdown">
                                <button className="nav-link  dropdown-toggle" type="button"
                                        id="dropdownMenuButton" data-bs-toggle="dropdown" aria-expanded="false">
                                    {email} <span className="caret"></span>
                                </button>
                                <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                    <li><button className="dropdown-item"
                                                onClick={(event)=>{event.preventDefault();
                                                    handleLogout();}}>
                                        Logout
                                    </button></li>
                                </ul>
                            </li>
                        </ul>)}
                </div>
            </div>
        </nav>
    );
};

export default Header;
export type { MenuItem };

