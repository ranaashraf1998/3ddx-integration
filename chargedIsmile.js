
/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 * @NModuleScope SameAccount
 */
 define(["N/search", "N/record", "N/format"], /**
 * @param {search} search
 * @param {record} record
 */ function (search, record, format) {
  /*
   * Function called upon sending a POST request to the RESTlet.
   *
   * @param {string | Object} requestBody - The HTTP request body; request body will be passed into function as a string when request Content-Type is 'addCase'
   * or parsed into an Object when request Content-Type is 'application/json' (in which case the body must be a valid JSON)
   * @returns {string | Object} HTTP response b
   * ody; return string when request Content-Type is 'addCase'; return Object when request Content-Type is 'application/json'
   * @since 2015.2
   */
function returnSalesOrder(id){
  if (parseInt(id)>0) {
    var order =  record.load({ type: "salesorder",id: id,isDynamic: true});
   // change
   // var patient = order.getValue({ fieldId: "custbody_dt_patient_name"})
    var orderType=order.getValue({fieldId: "custbody_dt_ismile_type"})
    //var archType=order.getValue({fieldId: "custbody_dt_arch_of_interest"})

    return {
        
      "subOrderId":id,
      "orderType":orderType,
      "chargedOn":"",
      "billed":"",
      "receivedDate":"",
      "ismileRef":""
    }

  
  }else{
    return "";
  } 


}

 
  function getCase(context) {
  try {
    
   /////////////////main
      var page = context.pagenumber;
      var startindex = (page-1)*21;
      var lastindex = (page*21)-1;
      var count = 0 ;
    
      var ismileRef= search.createColumn({ name: 'custbody_dt_ismile_case_ref_no', join: 'createdFrom', sort: search.Sort.ASC });
    var addCasesList = search.create({
        type: "invoice",
        filters: [
            ['type', 'anyof', 'CustInvc'],
            'AND',
        
            ['name', 'anyof', context.userId],
            'AND',
            ['status', 'anyof', 'CustInvc:B'],
            'AND',
            ['mainline', 'is', 'T'],
            'AND',
            ['createdfrom', 'noneof', '@NONE@'],
            'AND',
            ['createdfrom.custbody_dt_order_types_cf', 'anyof', '8'], 'AND',
            ['createdfrom.custbody_dt_ismile_case_ref_no', 'noneof', '@NONE@'],
          ],

         columns:[
                    "internalid",
                    "createdfrom",
                    "total",
                    "datecreated",
                    "status",
                    "currency",
                    "custbody_dt_ismile_case_ref_no",
                    "custbody_dt_patient_name",
                    "custbody_dt_arch_of_interest",
                    ismileRef
                    
                ]
         
       }).run().getRange(0,1000);

    
        var arraylist = [];
        var tempArray=[];
        var ismileTotal=0;
      if (startindex<addCasesList.length) {
        if (lastindex>addCasesList.length) {
          var temp=addCasesList[0].getValue(ismileRef);
          for(var i=startindex; i<addCasesList.length; i++){
            var ismileRefNo=addCasesList[i].getValue(ismileRef);
          
           var jsonReturn = returnSalesOrder(addCasesList[i].getValue("createdfrom"));
             
           if (jsonReturn != "" ){
            var invoiceRecord=record.load({
                type: "invoice",
                id: addCasesList[i].id
               
            })
            
           var chargedON = invoiceRecord.getSublistValue({sublistId: "links", fieldId: "trandate", line:0 });
            var total=addCasesList[i].getValue("total");
             var date=addCasesList[i].getValue("datecreated");
            // var currency=addCasesList[i].getValue("currency");
           
            jsonReturn.chargedOn=chargedON;
            jsonReturn.billed=total;
           // jsonReturn.currency=currency;
            jsonReturn.receivedDate=date;
            jsonReturn.ismileRef=ismileRefNo;

            if(temp==ismileRefNo){
              ismileTotal=ismileTotal+parseFloat(total);
               tempArray.push(jsonReturn);
            }
            else{

              arraylist.push({"ismileId":temp,
              "patient":addCasesList[i-1].getValue("custbody_dt_patient_name"),
              "archType":addCasesList[i-1].getValue("custbody_dt_arch_of_interest"),
              "ismileTotal":ismileTotal,
              "currency":addCasesList[i-1].getValue("currency"),
              "suborders":tempArray});
              count++;
              tempArray=[];
             
              ismileTotal=0;
              tempArray.push(jsonReturn);
              ismileTotal=parseFloat(total);
              temp=addCasesList[i].getValue(ismileRef);
            }
            if(i+1 == addCasesList.length){

              arraylist.push({"ismileId":temp,
              "patient":addCasesList[i].getValue("custbody_dt_patient_name"),
              "archType":addCasesList[i].getValue("custbody_dt_arch_of_interest"),
              "ismileTotal":ismileTotal,
              "currency":addCasesList[i].getValue("currency"),
              "suborders":tempArray});
              count++;
            }

           }
           }
        }
        else{
          var temp=addCasesList[0].getValue(ismileRef);
          for(var i=startindex; i<lastindex; i++){
           
            var ismileRefNo=addCasesList[i].getValue(ismileRef);
            
            var jsonReturn = returnSalesOrder(addCasesList[i].getValue("createdfrom"));
              
            if (jsonReturn != "" ){
             var invoiceRecord=record.load({
                 type: "invoice",
                 id: addCasesList[i].id
                
             })
             
            var chargedON = invoiceRecord.getSublistValue({sublistId: "links", fieldId: "trandate", line:0 });
             var total=addCasesList[i].getValue("total");
              var date=addCasesList[i].getValue("datecreated");
              //var currency=addCasesList[i].getValue("currency");
            
             jsonReturn.chargedOn=chargedON;
             jsonReturn.billed=total;
            // jsonReturn.currency=currency;
             jsonReturn.receivedDate=date;
             jsonReturn.ismileRef=ismileRefNo;
 
             if(temp==ismileRefNo){
               ismileTotal=ismileTotal+parseFloat(total);
                tempArray.push(jsonReturn);
             }
             else{
 
               arraylist.push({"ismileId":temp,
               "patient":addCasesList[i-1].getValue("custbody_dt_patient_name"),
              
               "archType":addCasesList[i-1].getValue("custbody_dt_arch_of_interest"),
               "ismileTotal":ismileTotal,
               "currency":addCasesList[i-1].getValue("currency"),
               "suborders":tempArray});
               count++;
               tempArray=[];
              
               ismileTotal=0;
               tempArray.push(jsonReturn);
               ismileTotal=parseFloat(total);
               temp=addCasesList[i].getValue(ismileRef);
             }
             if(i+1 == addCasesList.length){

              arraylist.push({"ismileId":temp,
              "patient":addCasesList[i].getValue("custbody_dt_patient_name"),
              "archType":addCasesList[i].getValue("custbody_dt_arch_of_interest"),
              "ismileTotal":ismileTotal,
              "currency":addCasesList[i].getValue("currency"),
              "suborders":tempArray});
              count++;
            }
 
            }
           }
          }
      }
      else{
          return {
            "error":"out of range"
          }
      }


       return {
        "count":count,
        "data":arraylist
       };

     
    
  
  } catch (error) {
    return error;
  }
 
  }

  return {
    get: getCase,
  };
});
