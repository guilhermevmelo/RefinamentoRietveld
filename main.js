/**
 * Created by guilherme on 3/9/15.
 */

var values = null;
var hkl_values = null;
var symmetry = null;
var K = 0.9;

var Y2O3 = {
    gu: 0,
    gv: 11.9150,
    gw: 26.5385,
    gp: 0,
    lx: 4.19802,
    ptec: 0
};

var LaB6 = {
    gu: 0.711101,
    gv: 2.7183,
    gw: 0.902028,
    gp: 0,
    lx: 3.41243,
    ptec: 0
};

function updatePatternProfile(patternName) {
    var pattern = null;

    switch(patternName) {
        case "Y2O3": pattern = Y2O3; break;
        case "LaB6": pattern = LaB6; break;
    }

    $("#patternGu").val(pattern.gu);
    $("#patternGv").val(pattern.gv);
    $("#patternGw").val(pattern.gw);
    $("#patternGp").val(pattern.gp);
    $("#patternLx").val(pattern.lx);
    $("#patternPtec").val(pattern.ptec);

    calculateGaussMicrostrain();
}

function updateLatticeValues(phaseNumber) {
    //Debug: console.log("::updateLatticeValues", phaseNumber);
    var phaseObj;
    switch (phaseNumber) {
        case 1:
            //Debug: console.log("phaseNumber = ", 1);
            phaseObj = values.lattice1;
            break;
        case 2:
            //Debug:  console.log("phaseNumber = ", 2);
            phaseObj = values.lattice2;
            break;
        case 3:
            //Debug: console.log("phaseNumber = ", 3);
            phaseObj = values.lattice3;
            break;
    }

    //Debug: console.log("::updateLattice with parameter", phaseObj);

    $("#lattice_a").html(phaseObj.a + "&angst;");
    $("#lattice_b").html(phaseObj.b + "&angst;");
    $("#lattice_c").html(phaseObj.c + "&angst;");
    $("#lattice_alpha").html(phaseObj.alpha + "&deg;");
    $("#lattice_beta").html(phaseObj.beta + "&deg;");
    $("#lattice_gamma").html(phaseObj.gamma + "&deg;");
    $("#lattice_vol").html(phaseObj.volume + "&angst;<sup>2</sup>");
}

function calculateCristalliteSize() {
    var lambda = parseFloat($("#lambda").val());
    var lx = parseFloat($("#sampleLx").val()); // values.profile.lx
    var ptec = parseFloat($("#samplePtec").val()); // values.profile.ptec
    var gp = parseFloat($("#sampleGp").val()); // values.profile.gp

    var lorentzPerp = 18000 * K * lambda / (Math.PI * lx);
    var lorentzPara = 18000 * K * lambda / (Math.PI * (lx + ptec));
    var gauss = 18000 * K * lambda / (Math.PI * Math.sqrt(8 * Math.log(2) * gp));

    $("#lorentzPerp").val(lorentzPerp);
    $("#lorentzPara").val(lorentzPara);
    $("#gauss").val(gauss);
}

function calculateGaussMicrostrain() {
    var GU = parseFloat($("#sampleGu").val());
    var GUi = parseFloat($("#patternGu").val());

    var gaussMicrostrain = (Math.PI * Math.sqrt((8 * Math.log(2))*(GU - GUi)))/180;

    $("#gaussMicrostrain").val(gaussMicrostrain);
}

function calculate_shkl(symmetry, h, k, l) {
    var TauS2;
    var s = [];
    var R = Math.PI/180;

    var phaseObj;
    switch (parseInt(values.phase)) {
        case 1:
            //Debug: console.log("phaseNumber = ", 1);
            phaseObj = values.lattice1;
            break;
        case 2:
            //Debug:  console.log("phaseNumber = ", 2);
            phaseObj = values.lattice2;
            break;
        case 3:
            //Debug: console.log("phaseNumber = ", 3);
            phaseObj = values.lattice3;
            break;
    }

    var V1 = phaseObj.a * phaseObj.b * phaseObj.c;
    var V = V1 * Math.sqrt(1 - Math.pow(Math.cos(phaseObj.alpha * R), 2)
                             - Math.pow(Math.cos(phaseObj.beta * R), 2)
                             - Math.pow(Math.cos(phaseObj.gamma * R), 2)
                             + 2 * Math.cos(phaseObj.alpha * R)
                                 * Math.cos(phaseObj.beta * R)
                                 * Math.cos(phaseObj.gamma * R));


    var aR = phaseObj.b * phaseObj.c * Math.sin(phaseObj.alpha * R) / V;
    var bR = phaseObj.a * phaseObj.c * Math.sin(phaseObj.beta * R) / V;
    var cR = phaseObj.a * phaseObj.b * Math.sin(phaseObj.gamma * R) / V;

    var cosAR = (Math.cos(phaseObj.beta * R) * Math.cos(phaseObj.gamma * R) - Math.cos(phaseObj.alpha * R))/(Math.sin(phaseObj.beta * R)*Math.sin(phaseObj.gamma * R));
    var cosBR = (Math.cos(phaseObj.alpha * R) * Math.cos(phaseObj.gamma * R) - Math.cos(phaseObj.beta * R))/(Math.sin(phaseObj.alpha * R)*Math.sin(phaseObj.gamma * R));
    var cosCR = (Math.cos(phaseObj.alpha * R) * Math.cos(phaseObj.beta * R) - Math.cos(phaseObj.gamma * R))/(Math.sin(phaseObj.alpha * R)*Math.sin(phaseObj.beta * R));

    var D1 = 2*h*k*aR*bR*cosCR + 2*h*l*aR*cR*cosBR + 2*k*l*bR*cR*cosAR;

    var Di = h*h*aR*aR + k*k*bR*bR + l*l*cR*cR + D1;


    var d = Math.sqrt(1/Di);
    
    switch(symmetry) {
        case 1: /* Monoclinic */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s040").val());
            s[2] = parseFloat($("#s004").val());
            s[3] = parseFloat($("#s202").val());
            s[4] = parseFloat($("#s220").val());
            s[5] = parseFloat($("#s022").val());
            s[6] = parseFloat($("#s301").val());
            s[7] = parseFloat($("#s103").val());
            s[8] = parseFloat($("#s121").val());
            break;

        case 2: /* Orthorhombic */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s040").val());
            s[2] = parseFloat($("#s004").val());
            s[3] = parseFloat($("#s220").val());
            s[4] = parseFloat($("#s202").val());
            s[5] = parseFloat($("#s022").val());
            break;

        case 3: /* Tetragonal (4/m) */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s004").val());
            s[2] = parseFloat($("#s220").val());
            s[3] = parseFloat($("#s002").val());
            s[4] = parseFloat($("#s301").val());
            break;

        case 4: /* Tetragonal (4/mmm) */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s004").val());
            s[2] = parseFloat($("#s220").val());
            s[3] = parseFloat($("#s002").val());
            break;

        case 5: /* Trigonal 3 - rhombohedral setting */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s220").val());
            s[2] = parseFloat($("#s310").val());
            s[3] = parseFloat($("#s130").val());
            s[4] = parseFloat($("#s211").val());
            break;

        case 6: /* Trigonal 3m - rhombohedral setting */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s220").val());
            s[2] = parseFloat($("#s310").val());
            s[3] = parseFloat($("#s211").val());
            break;

        case 7: /* Trigonal 3 */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s004").val());
            s[2] = parseFloat($("#s202").val());
            s[3] = parseFloat($("#s301").val());
            s[4] = parseFloat($("#s211").val());
            break;

        case 8: /* Trigonal 3ml */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s004").val());
            s[2] = parseFloat($("#s202").val());
            s[3] = parseFloat($("#s301").val());
            break;

        case 9: /* Trigonal 3lm */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s004").val());
            s[2] = parseFloat($("#s202").val());
            s[3] = parseFloat($("#s211").val());
            break;

        case 10: /* Hexagonal (6/m and 6/mmm) */
            //console.log("Hexagonal", values.profile.s1, values.profile.s2, values.profile.s3);
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s004").val());
            s[2] = parseFloat($("#s202").val());
            break;

        case 11: /* Cubic (3m and m3m) */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s220").val());
            break;

        case 12: /* Triclinic */
            s[0] = parseFloat($("#s400").val());
            s[1] = parseFloat($("#s040").val());
            s[2] = parseFloat($("#s004").val());
            s[3] = parseFloat($("#s220").val());
            s[4] = parseFloat($("#s202").val());
            s[5] = parseFloat($("#s022").val());
            s[6] = parseFloat($("#s310").val());
            s[7] = parseFloat($("#s103").val());
            s[8] = parseFloat($("#s031").val());
            s[9] = parseFloat($("#s130").val());
            s[10] = parseFloat($("#s301").val());
            s[11] = parseFloat($("#s013").val());
            s[12] = parseFloat($("#s211").val());
            s[13] = parseFloat($("#s121").val());
            s[14] = parseFloat($("#s112").val());
            break;
    }

    switch(symmetry) {
        case 1: /* Monoclinic */
            /* ΓS2 = S400h4 +S040k4 +S004l4 +3S202h2l2 +3(S220h2k2 +S022k2l2)+ 2(S301h3l+S103hk3)+4S121hk2l */
            TauS2 = s[0]*Math.pow(h, 4) + s[1]*Math.pow(k, 4) + s[2]*Math.pow(l, 4) + 3*s[3]*h*h*l*l + 3*(s[4]*h*h*k*k + s[4]*k*k*l*l) + 2*(s[6]*Math.pow(h,3)*l + s[7]*h*Math.pow(k, 3)) * s[8]*h*k*k*l;
            break;
        case 2: /* Orthorhombic */
            /*  ΓS2 = S400h4 +S040k4 +S004l4 +3(S220h2k2 +S202h2l2 +S022k2l2) */
            TauS2 = s[0]*Math.pow(h, 4) + s[1]*Math.pow(k, 4) + s[2]*Math.pow(l, 4) + 3*(s[3]*h*h*k*k + s[4]*h*h*l*l + s[5]*k*k*l*l);
            break;
        case 3: /* Tetragonal (4/m) */
            /* ΓS2 = S400 (h4 + k4 )+ S004l4 + 3S220h2k2 + 3S202 (h2l2 + k2l2 )+ 2S310 (h3k − hk3 ) */
            TauS2 = s[0]*(Math.pow(h, 4) + Math.pow(k, 4)) + s[1]*Math.pow(l, 4) + 3*s[2]*h*h*k*k + 3*s[3]*(h*h*l*l + k*k*l*l) + s[4]*(h*Math.pow(k, 3) - h*Math.pow(k, 3));
            break;
        case 4: /* Tetragonal (4/mmm) */
            /* ΓS2 = S400(h4 +k4)+S004l4 +3S220h2k2 +3S202(h2l2 +k2l2) */
            TauS2 = s[0]*(Math.pow(h, 4) + Math.pow(k, 4)) + s[1]*4*Math.pow(l, 4 ) + 3*s[2]*h*h*k*k + 3*s[3]*(h*h*l*l + k*k*l*l);
            break;
        case 5: /* Trigonal 3 - rhombohedral setting */
            /* ΓS2 = S400(h4 +k4 +l4)+3S220(h2k2 +h2l2 +k2l2)+ 2S310(h3k+k3l+hl3)+2S130(h3l+kl3 +hk3)+ 4S211(h2kl+hk2l+hkl2) */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +Math.pow(l, 4))+3*s[1]*(h*h*k*k +h*h*l*l +k*k*l*l)+ 2*s[2]*(Math.pow(h, 3)*k+Math.pow(k, 3)*l+h*Math.pow(l, 3))+2*s[3]*(Math.pow(h, 3)*l+k*Math.pow(l, 3) +h*Math.pow(k, 3))+ 4*s[4]*(h*h*k*l+h*k*k*l+h*k*l*l);
            break;
        case 6: /* Trigonal 3m - rhombohedral setting */
            /* ΓS2 = S400(h4 +k4 +l4)+3S220(h2k2 +h2l2 +k2l2)+ 2S310(h3k+hl3 +k3l+hk3 +h3l+kl3)+ 4S211(h2kl+hk2l+hkl2) */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +Math.pow(l, 4))+3*s[1]*(h*h*k*k +h*h*l*l +k*k*l*l)+ 2*s[2]*(Math.pow(h, 3)*k+h*Math.pow(l, 3) +Math.pow(k, 3)*l+h*Math.pow(k, 3) +Math.pow(h, 3)*l+k*Math.pow(l, 3))+ 4*s[3]*(h*h*k*l+h*k*k*l+h*k*l*l);
            break;
        case 7: /* Trigonal 3 */
            /* ΓS2 =S400(h4 +k4 +2h3k+2hk3 +3h2k2)+S004l4 +3S202(h2l2 +k2l2 +hkl2)+S301(2h3l − 2k3l − 6hk2l)+ 4S211(h2kl + hk2l) */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +2*Math.pow(h, 3)*k+2*h*Math.pow(k, 3) +3*h*h*k*k)+s[1]*Math.pow(l, 4) +3*s[2]*(h*h*l*l +k*k*l*l +h*k*l*l)+ s[3]*(2*Math.pow(h, 3)*l - 2*Math.pow(k, 3)*l - 6*h*k*k*l) + 4*s[4]*(h*h*k*l + h*k*k*l);
            break;
        case 8: /* Trigonal 3ml */
            /* ΓS2 = S400(h4 +k4 +3h2k2 +2h3k+2hk3)+S004l4 +3S202(h2l2 +k2l2 +hkl2)+ S301(3h2k−3hk2 +2h3 -2k3)l */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +3*h*h*k*k +2*Math.pow(h, 3)*k+2*h*Math.pow(k, 3))+s[1]*Math.pow(l, 4) +3*s[2]*(h*h*l*l +k*k*l*l +h*k*l*l)+ s[3]*(3*h2k-3*hk2 +2*h3 -2*k3)*l;
            break;
        case 9: /* Trigonal 3lm */
            /* ΓS2 =S400(h4 +k4 +3h2k2 +2h3k+2hk3)+S004l4 +3S202(h2l2 +k2l2 +hkl2)+ 4S211(h2kl+hk2l) */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +3*h*h*k*k +2*Math.pow(h, 3)*k+2*h*Math.pow(k, 3))+s[1]*Math.pow(l, 4) +3*s[2]*(h*h*l*l +k*k*l*l +h*k*l*l)+ 4*s[3]*(h*h*k*l+h*k*k*l);
            break;
        case 10: /* Hexagonal (6/m and 6/mmm) */
            /* ΓS2 = S400(h4 +k4 +3h2k2 +2h3k+2hk3)+S004l4 +3S202(h2l2 +k2l2 +hkl2) */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +3*h*h*k*k +2*Math.pow(h, 3)*k+2*h*Math.pow(k, 3))+s[1]*Math.pow(l, 4) +3*s[2]*(h*h*l*l +k*k*l*l +h*k*l*l);
            break;
        case 11: /* Cubic (3m and m3m) */
            /* ΓS2 = S400(h4 +k4 +l4)+3S220(h2k2 +h2l2 +k2l2) */
            TauS2 = s[0]*(Math.pow(h, 4) +Math.pow(k, 4) +Math.pow(l, 4))+3*s[1]*(h*h*k*k +h*h*l*l +k*k*l*l);
            break;
        case 12: /* Triclinic */
            /* ΓS2 = S400h4 +S040k4 +S004l4 +3(S220h2k2 +S202h2l2 +S022k2l2)+ 2(S310h3k + S103hl3 + S031k3l + S130hk3 + S301h3l + S013kl3 )+ 4(S211h2kl+S121hk2l+S112hkl2) */
            TauS2 = s[0]*Math.pow(h, 4) +s[1]*Math.pow(k, 4) +s[2]*Math.pow(l, 4) +3*(s[3]*h*k*k +s[4]*h*l*l +s[5]*k*l*l)+ 2*(s[6]*Math.pow(h, 3)*k + s[7]*h*Math.pow(l, 3) + s[8]*Math.pow(k, 3)*l + s[9]*h*Math.pow(k, 3) + s[10]*Math.pow(h, 3)*l + s[11]*k*Math.pow(l, 3) )+ 4*(s[12]*h*h*k*l+s[13]*(h*k*k*l+s[14]*h*k*l*l));
            break;
    }

    return Math.PI*d*d*Math.sqrt(TauS2)/180;
}

function updateShklValues() {
    /* Debug: console.log(Object.keys(hkl_values).length); */

     for (var i = 1; i <= Object.keys(hkl_values).length; i++) {
        hkl_values[i].s_shkl = calculate_shkl(parseInt($("#symmetry").val()), hkl_values[i].h, hkl_values[i].k, hkl_values[i].l);
        console.log(hkl_values[i].s_shkl);
     }

     fillShklTable();
}

function fillShklTable() {


    $("#peakValuesTable").empty().html("<tr><th>nº</th><th>h</th> <th>k</th> <th>l</th> <th>2&theta;</th> <th>S<sub>S</sub>(hkl)</th> </tr>");


    for (var i = 1; i <= Object.keys(hkl_values).length; i++) {
        var tr = document.createElement("tr");
        var td_n = document.createElement("td");
        td_n.appendChild(document.createTextNode(i));
        var td_h = document.createElement("td");
        td_h.appendChild(document.createTextNode(""+hkl_values[i].h));
        var td_k = document.createElement("td");
        td_k.appendChild(document.createTextNode(""+hkl_values[i].k));
        var td_l = document.createElement("td");
        td_l.appendChild(document.createTextNode(""+hkl_values[i].l));
        var td_tth = document.createElement("td");
        td_tth.appendChild(document.createTextNode(""+hkl_values[i].tth));
        var td_shkl = document.createElement("td");
        td_shkl.appendChild(document.createTextNode(""+hkl_values[i].s_shkl));
        tr.appendChild(td_n);
        tr.appendChild(td_h);
        tr.appendChild(td_k);
        tr.appendChild(td_l);
        tr.appendChild(td_tth);
        tr.appendChild(td_shkl);
        document.getElementById("peakValuesTable").appendChild(tr);
    }
}

$(document).ready(function() {
    updatePatternProfile("Y2O3");

    /* Let' set an event handler for finding the number of phases when the file is selected */
    $("#inputFile").change(function () {
        /* Prepare the data set to be sent to the parser */
        var fileObject = $("#inputFile")[0].files[0];
        var dataSet = new FormData();
        dataSet.append('q', 'uploadFile');                      // What do we want to do?
        dataSet.append('findNumberOfPhases', true);             // We want only to retrieve the number of phases
        dataSet.append('inputFile', fileObject);                // What file are we sending?

        /* Perform the first AJAX request */
        $.ajax({
            method: "POST",
            url: "action.php",
            cache: false,
            contentType: false,
            processData: false,
            data: dataSet
        }).done(function (answer) {
            /* Values were received from the server */
            values = answer;
            /* Debug: */ console.log("First AJAX request performed with the following result: ", answer);

            /* Set the number of phases so the user can select to which perform operation */
                /* Remove previous options for number os phases */
            $("#phaseNumber").empty();

                /* Then append new ones */
            for (var i = 1; i <= values.nPhases; i++) {
                $("#phaseNumber").append("<option value=\""+i+"\">"+i+"</option>");
            }
            updateLatticeValues(1);
        });
    });

    /* Now we set an event handler for when the [CONTINUE] button is pressed */
    $("#sbmtFormPreConfig").click(function() {
        /* Prepare the data set to be sent to the parser */
        var fileObject = $("#inputFile")[0].files[0];
        var dataSet = new FormData();
        dataSet.append('q', 'uploadFile');                          // What do we want to do?
        dataSet.append('inputFile', fileObject);                    // What file are we sending?
        dataSet.append('symmetry', $("#symmetry").val());           // What is the Laue symmetry of the phase?
        dataSet.append('phase', parseInt($("#phaseNumber").val())); // What is the phase?

        /* Perform the second AJAX request */
        $.ajax({
            method: "POST",
            url: "action.php",
            cache: false,
            contentType: false,
            processData: false,
            data: dataSet
        }).done(function (answer) {
            /* Values were received from the server */
            values = answer;
            /*Debug:*/ console.log("Second AJAX request performed with the following result:", answer);

            /* Fill the profile values */
            $("#sampleGu").val(values.profile.gu);
            $("#sampleGv").val(values.profile.gv);
            $("#sampleGw").val(values.profile.gw);
            $("#sampleGp").val(values.profile.gp);
            $("#sampleLx").val(values.profile.lx);
            $("#samplePtec").val(values.profile.ptec);

            /* Now we clean the present values. */
            $(".profileShkl").val("");
            $(".profileShkl").attr("disabled", "disabled");

            switch(parseInt(values.symmetry)) {
                case 1: /* Monoclinic */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s040").val(values.profile.s2).removeAttr("disabled");
                    $("#s004").val(values.profile.s3).removeAttr("disabled");
                    $("#s202").val(values.profile.s4).removeAttr("disabled");
                    $("#s220").val(values.profile.s5).removeAttr("disabled");
                    $("#s022").val(values.profile.s6).removeAttr("disabled");
                    $("#s301").val(values.profile.s7).removeAttr("disabled");
                    $("#s103").val(values.profile.s8).removeAttr("disabled");
                    $("#s121").val(values.profile.s9).removeAttr("disabled");
                    break;

                case 2: /* Orthorhombic */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s040").val(values.profile.s2).removeAttr("disabled");
                    $("#s004").val(values.profile.s3).removeAttr("disabled");
                    $("#s220").val(values.profile.s4).removeAttr("disabled");
                    $("#s202").val(values.profile.s5).removeAttr("disabled");
                    $("#s022").val(values.profile.s6).removeAttr("disabled");
                    break;

                case 3: /* Tetragonal (4/m) */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s004").val(values.profile.s2).removeAttr("disabled");
                    $("#s220").val(values.profile.s3).removeAttr("disabled");
                    $("#s002").val(values.profile.s4).removeAttr("disabled");
                    $("#s301").val(values.profile.s5).removeAttr("disabled");
                    break;

                case 4: /* Tetragonal (4/mmm) */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s004").val(values.profile.s2).removeAttr("disabled");
                    $("#s220").val(values.profile.s3).removeAttr("disabled");
                    $("#s002").val(values.profile.s4).removeAttr("disabled");
                    break;

                case 5: /* Trigonal 3 - rhombohedral setting */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s220").val(values.profile.s2).removeAttr("disabled");
                    $("#s310").val(values.profile.s3).removeAttr("disabled");
                    $("#s130").val(values.profile.s4).removeAttr("disabled");
                    $("#s211").val(values.profile.s5).removeAttr("disabled");
                    break;

                case 6: /* Trigonal 3m - rhombohedral setting */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s220").val(values.profile.s2).removeAttr("disabled");
                    $("#s310").val(values.profile.s3).removeAttr("disabled");
                    $("#s211").val(values.profile.s4).removeAttr("disabled");
                    break;

                case 7: /* Trigonal 3 */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s004").val(values.profile.s2).removeAttr("disabled");
                    $("#s202").val(values.profile.s3).removeAttr("disabled");
                    $("#s301").val(values.profile.s4).removeAttr("disabled");
                    $("#s211").val(values.profile.s5).removeAttr("disabled");
                    break;

                case 8: /* Trigonal 3ml */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s004").val(values.profile.s2).removeAttr("disabled");
                    $("#s202").val(values.profile.s3).removeAttr("disabled");
                    $("#s301").val(values.profile.s4).removeAttr("disabled");
                    break;

                case 9: /* Trigonal 3lm */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s004").val(values.profile.s2).removeAttr("disabled");
                    $("#s202").val(values.profile.s3).removeAttr("disabled");
                    $("#s211").val(values.profile.s4).removeAttr("disabled");
                    break;

                case 10: /* Hexagonal (6/m and 6/mmm) */
                    //console.log("Hexagonal", values.profile.s1, values.profile.s2, values.profile.s3);
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s004").val(values.profile.s2).removeAttr("disabled");
                    $("#s202").val(values.profile.s3).removeAttr("disabled");
                    break;

                case 11: /* Cubic (3m and m3m) */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s220").val(values.profile.s2).removeAttr("disabled");
                    break;

                case 12: /* Triclinic */
                    $("#s400").val(values.profile.s1).removeAttr("disabled");
                    $("#s040").val(values.profile.s2).removeAttr("disabled");
                    $("#s004").val(values.profile.s3).removeAttr("disabled");
                    $("#s220").val(values.profile.s4).removeAttr("disabled");
                    $("#s202").val(values.profile.s5).removeAttr("disabled");
                    $("#s022").val(values.profile.s6).removeAttr("disabled");
                    $("#s310").val(values.profile.s7).removeAttr("disabled");
                    $("#s103").val(values.profile.s8).removeAttr("disabled");
                    $("#s031").val(values.profile.s9).removeAttr("disabled");
                    $("#s130").val(values.profile.s10).removeAttr("disabled");
                    $("#s301").val(values.profile.s11).removeAttr("disabled");
                    $("#s013").val(values.profile.s12).removeAttr("disabled");
                    $("#s211").val(values.profile.s13).removeAttr("disabled");
                    $("#s121").val(values.profile.s14).removeAttr("disabled");
                    $("#s112").val(values.profile.s15).removeAttr("disabled");
                    break;
            }

            calculateCristalliteSize();
            calculateGaussMicrostrain();

            $("#inputRFLFile").removeAttr("disabled");
        });
    });

    $("#inputRFLFile").change(function () {
        /* Prepare the data set to be sent to the parser */
        var fileObject = $("#inputRFLFile")[0].files[0];
        var dataSet = new FormData();
        dataSet.append('q', 'uploadRFLFile');                      // What do we want to do?
        dataSet.append('symmetry', parseInt($("#symmetry").val()));           // What is the Laue symmetry of the phase?
        dataSet.append('inputFile', fileObject);                // What file are we sending?

        /* Perform the third AJAX request */
        $.ajax({
            method: "POST",
            url: "action.php",
            cache: false,
            contentType: false,
            processData: false,
            data: dataSet
        }).done(function (answer) {
            /* Values were received from the server */
            hkl_values = answer;
            /* Debug: */ console.log("Third AJAX request performed with the following result: ", answer);

            $("#sbmtCalculateSshkl").removeAttr("disabled");

            updateShklValues();

            //for(var line in hkl_values) {
            //
            //    line.s_shkl = calculate_shkl(symmetry, line.h, line.k, line.l);
            //    console.log(line.s_shkl);
            //}

        });
    });

    $("#phaseNumber").change(function(){
        //Debug: console.log($(this).val());
        updateLatticeValues(parseInt($(this).val()));
    });

    $("#patternName").change(function() {
        updatePatternProfile($(this).val());
    });

    $("#sbmtCalculateSshkl").click(function() {
        updateShklValues();
    });

});
