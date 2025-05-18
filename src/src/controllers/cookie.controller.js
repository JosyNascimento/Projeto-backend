const setSignedCookie = (req, res) => {
    res
      .cookie("SignedCookie", "Esse Cookie foi assinado com sucesso", {
        maxAge: 100000000,
        signed: true,
      })
      .send("Cookie");
  };
  
  const setCookie = (req, res) => {
    console.log(req.cookies);
    res
      .cookie("CoderCookie", "Esse Cookie foi setado com sucesso", {
        maxAge: 10000000000,
      })
      .send("Cookie");
  };
  
  const getCookies = (req, res) => {
    res.send(req.cookies);
  };
  
  const getSignedCookies = (req, res) => {
    res.send(req.signedCookies);
  };
  
  const postSetCookie = (req, res) => {
    const { name, email } = req.body;
    res.cookie(name, email, { maxAge: 100000 }).send("Cookie setado com sucesso");
  };
  
  const deleteCookie = (req, res) => {
    res.clearCookie("CoderCookie").send("Cookie deletado");
  };
  
  module.exports = {
    setSignedCookie,
    setCookie,
    getCookies,
    getSignedCookies,
    postSetCookie,
    deleteCookie,
  };
  