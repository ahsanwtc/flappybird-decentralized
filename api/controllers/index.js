'use strict';
const FloopyDA = require('../data/FlappybirdDA');
const SmartContractDA = require('../data/SmartContractDA');
const matchCode = 5;
const dbfilepath = '../flappybird.db';
const helper = require('./helper');


const getBalance = async address => {
  const dao = new SmartContractDA();
  return await dao.getBalance(address);
};

const addPlayer = async address => {
  try {
    const dao = new FloopyDA(dbfilepath);
    return await dao.AddPlayerVault(address);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTicketBalance = async address => {
  const dao = new FloopyDA(dbfilepath);
  
  try{
    await dao.AddPlayerVault(address);
  }
  catch{}

  try {
    return await dao.GetPlayerBalance(address);
  } catch (error) {
    console.log(error);
    return null;
  }
};

const getTopPlayer = async () => {
  const dao = new FloopyDA(dbfilepath);
  try {
    return await dao.GetTopPlayer();
  } catch (error) {
    console.log(error);
    return null;
  }
};

const addTicketBalance = async (address, amount, transaction_id) => {
  try {
    const dao = new FloopyDA(dbfilepath);
    return await dao.AddPlayerBalance(address, amount, transaction_id);
  } catch (error) {
    console.log(`add ticket balance: `+error);
    return null;
  }
};

const withdrawTicketBalance = async (address, amount) => {
  try {
    const dao = new FloopyDA(dbfilepath);
    const result =  await dao.WithdrawPlayerBalance(address, amount);
    return result;
  } catch (error) {
    console.log(error);
  }
  return null;
};

const updateTransaction = async (id, transid) => {
  try {
    const dao = new FloopyDA(dbfilepath);
    const result =  await dao.UpdateTransaction(id, transid);
    return result;
  } catch (error) {
    console.log(error);
  }
  return null;
};

const startPlayerMatch = async address => {
  try {
    const dao = new FloopyDA(dbfilepath);
    const code =  await dao.WithdrawPlayerBalance(address, matchCode);
    if (code !== null) {
      const result =  await dao.StartPlayerMatch(address);
      return result;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

const endPlayerMatch = async (address, id, point, matchData) => {
  try {
    const dao = new FloopyDA(dbfilepath);
    const updateId = await dao.EndPlayerMatch(address, id, point, matchData);
    if (updateId !== null) {
      const result =  await dao.AddPlayerBalance(address, point, null);
      return result;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports.addPlayer = async (req, res) => {
  try {
    const bls = await addPlayer(req.query.address);
    if (bls === null) {
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    }
    return res.status(200).json(helper.APIReturn(0, { "balances": bls }, "Success"));

  } catch (error) {
    return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }
};

exports.getBalance = async function (req, res) {
  try {
    var bls = await getBalance(req.query.address);
    if (bls == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    return res.status(200).json(helper.APIReturn(0, { "balances": bls }, "Success"));

  } catch (error) {
    return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }
}

exports.getTitketBalance = async function (req, res) {
  try {
    var bls = await getTicketBalance(req.query.address);
    if (bls == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    return res.status(200).json(helper.APIReturn(0, { "balances": bls }, "Success"));

  } catch (error) {
    console.log(error);
    return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }
}

exports.withdraw = async function withdraw(req, res) {
  try {
    let {address, amount} = req.body;
    if(address ===undefined || amount === undefined || amount <= 0){
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }

    let result = await withdrawTicketBalance(address, amount);
    if(result == null){
      return res.status(400).json(helper.APIReturn(102, "bad request"));   
    }
    console.log("call smart contract");
    let dao = new SmartContractDAO.SmartContractDAO();
    let trans = await dao.withdraw(address, result.amount);
    await updateTransaction(result.transid, trans);
    return res.status(200).json(helper.APIReturn(0,{amount: result.amount, txHash: trans}, "success"));   
    
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "something wrongs"));
  }
}

exports.deposit = async function deposit(req, res) {
  try {
    let {address, amount, transaction_id} = req.body;
    if(address === undefined || amount === undefined || amount <= 0 || transaction_id === undefined){
      return res.status(400).json(helper.APIReturn(101, "bad request"));
    }
    let result = await addTicketBalance(address, amount, transaction_id);
    if(result == null){
      return res.status(400).json(helper.APIReturn(102, "bad request"));   
    }
    return res.status(200).json(helper.APIReturn(0,{result}, "success"));   
  } catch (error) {
    console.log(error);
    return res.status(500).json(helper.APIReturn(101, "something wrongs"));
  }
}

exports.startMatch = async function (req, res) {
  try {
    var bls = await startPlayerMatch(req.query.address);
    if (bls == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    return res.status(200).json(helper.APIReturn(0, { "Id": bls }, "Success"));

  } catch (error) {
    return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }
}

exports.endMatch = async function (req, res) {
  try {
    let {address, id, point, matchData} = req.body;

    var bls = await endPlayerMatch(address, id, point, matchData);
    if (bls == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));
    return res.status(200).json(helper.APIReturn(0, { "result": bls }, "Success"));

  } catch (error) {
    return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }
}

exports.getTop = async function (req, res) {
  try {
    var bls = await getTopPlayer();
    if (bls == null)
      return res.status(401).json(helper.APIReturn(101, "something wrongs"));

    return res.status(200).json(helper.APIReturn(0, { "result": bls }, "Success"));
  } catch (error) {
    return res.status(401).json(helper.APIReturn(101, "something wrongs"));
  }
}