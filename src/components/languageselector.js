import React from 'react';
import { useHistory } from '@docusaurus/router';

const LanguageSelector = () => {
  const history = useHistory();

  const changeLanguage = (locale) => {
    const currentPath = window.location.pathname;
    const newPath = `/${locale}${currentPath.replace(/^\/(en|id)/, '')}`;
    history.push(newPath);
  };

  return (
    <select onChange={(e) => changeLanguage(e.target.value)} defaultValue={window.location.pathname.startsWith('/id') ? 'id' : 'en'}>
      <option value="en">English</option>
      <option value="id">Bahasa Indonesia</option>
    </select>
  );
};

export default LanguageSelector;