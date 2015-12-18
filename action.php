<?php
/**
 * Created by PhpStorm.
 * User: guilherme
 * Date: 3/9/15
 * Time: 14:40
 */




$q = isset($_GET["q"]) ? $_GET["q"] : (isset($_POST["q"]) ? $_POST["q"] : null);

if (isset($q) && $q == "uploadFile") {

    header('Content-Type: application/json');

    /* Does finding the number of phases suffices us for now?  */
    $findNumberOfPhases = (isset($_POST["findNumberOfPhases"]) and $_POST["findNumberOfPhases"] == "true") ? true : false;

    /* Do we have a phase selected and thus a symmetry?  */
    $symmetry = isset($_POST["symmetry"]) ? $_POST["symmetry"] : null;
    $phase = isset($_POST["phase"]) ? $_POST["phase"] : null;

    $nS_hkl = 0;
    switch($symmetry) {
        case 1: /* Monoclinic */
            $nS_hkl = 9;
            break;
        case 2: /* Orthorhombic */
            $nS_hkl = 6;
            break;
        case 3: /* Tetragonal (4/m) */
            $nS_hkl = 5;
            break;
        case 4: /* Tetragonal (4/mmm) */
            $nS_hkl = 4;
            break;
        case 5: /* Trigonal 3 - rhombohedral setting */
            $nS_hkl = 5;
            break;
        case 6: /* Trigonal 3m - rhombohedral setting */
            $nS_hkl = 4;
            break;
        case 7: /* Trigonal 3 */
            $nS_hkl = 5;
            break;
        case 8: /* Trigonal 3ml */
            $nS_hkl = 4;
            break;
        case 9: /* Trigonal 3lm */
            $nS_hkl = 4;
            break;
        case 10: /* Hexagonal (6/m and 6/mmm) */
            $nS_hkl = 3;
            break;
        case 11: /* Cubic (3m and m3m) */
            $nS_hkl = 2;
            break;
        case 12: /* Triclinic */
            $nS_hkl = 15;
            break;
    }

    $fileTempName = $_FILES["inputFile"]["tmp_name"];

    $file = fopen($fileTempName, 'r');
    $fileLines = file($fileTempName);

    /*
     * Main JSON object. It has the following structure:
     *
     * {
     *    nPhases : n,
     *    lattice1 : {},
     *    lattice2 : {},
     *       :
     *    latticen : {}
     *    profile1 : {
     *       gu : n,
     *       gv : n,
     *       gw : n,
     *       gp : n,
     *       lx : n,
     *       ptec: n,
     *       sfec: n,
     *       eta : n
     *    },
     *    profile2 : {},
     *       :
     *    profile3 : {}
     *    histogram: {
     *       1 : {
     *          h : n,
     *          k : n,
     *          l : n,
     *       }
     *    }
     * }
     */
    $return = array();
    $return["nPhases"] = 0;
    if (isset($symmetry)) $return["symmetry"] = $symmetry;
    if (isset($phase)) $return["phase"] = $phase;

    /*
     * Find how many phases
     * Find Lattice values and profile parameters for each phase
     */
    $k = 0;
    $latticeFound = false;
    $profileFound = false;
    $numberOfPhases = 0;
    $currentPhase = 0;
    $currPhaseLattice = null;
    $phaseFound = false;
    foreach ($fileLines as $line) {
        if ($latticeFound === false and substr_count($line, 'Lattice parameters for powder data') > 0) {
            $latticeFound = true;
            continue;
        }

        if ($latticeFound === true) {

            if ($phaseFound === false and substr_count($line, 'Phase') > 0) {
                $phaseFound = true;
                $numberOfPhases++;
                sscanf($line, " Phase %d", $currentPhase);

                /* Debug: */
                //echo "\n:We have found phase nº " . $currentPhase;

                $currPhaseLattice = array();
                continue;
            }

            if ($phaseFound === true and substr_count($line, 'Value    :') > 0) {
                sscanf($line, " Value    : %f %f %f %f %f %f %f ", $currPhaseLattice["a"], $currPhaseLattice["b"], $currPhaseLattice["c"], $currPhaseLattice["alpha"], $currPhaseLattice["beta"], $currPhaseLattice["gamma"], $currPhaseLattice["volume"]);
                /*
                 * TODO Delete the following lines
                 * echo "\n:: a = " . $currPhaseLattice["a"];
                 * echo "\n:: b = " . $currPhaseLattice["b"];
                 * echo "\n:: c = " . $currPhaseLattice["c"];
                 * echo "\n:: alpha = " . $currPhaseLattice["alpha"];
                 * echo "\n:: beta = " . $currPhaseLattice["beta"];
                 * echo "\n:: theta = " . $currPhaseLattice["theta"];
                 * echo "\n:: volume " . $currPhaseLattice["volume"];
                 * echo "\n\n";*/

                $return["lattice".$numberOfPhases] = array(
                    "a" => $currPhaseLattice["a"],
                    "b" => $currPhaseLattice["b"],
                    "c" => $currPhaseLattice["c"],
                    "alpha" => $currPhaseLattice["alpha"],
                    "beta" => $currPhaseLattice["beta"],
                    "gamma" => $currPhaseLattice["gamma"],
                    "volume" => $currPhaseLattice["volume"]
                );

                $phaseFound = false;
            }
        }

        /* If we only want to find the number of phases and each phase's lattice parameters, there is no need to find the profile coefficients */
        if ($findNumberOfPhases == false) {
            if (/*$profileFound === false and */substr_count($line, 'Profile coefficients for histogram no.  1 and for phase no.') > 0) {
                /* If we enter this block then we have found a set of Profile Parameters.
                   We need now to know which phase are we talking about. */
                sscanf($line,   "   Profile coefficients for histogram no.  1 and for phase no.  %d:", $nCurrProfile);
                // Debug: $return["debug"]["nCurrProfile"] = $nCurrProfile;
                if ($nCurrProfile == $phase) {
                    $profileFound = true;
                    $profileLine = 1;
                    $currPhaseProfile = array();
                }

            }

            if ($profileFound === true and substr_count($line, 'Value    :') > 0) {
                if ($profileLine == 1) {
                    sscanf($line, " Value    : %f %f %f %f %f %f %f %f %f %f ", $currPhaseProfile["gu"], $currPhaseProfile["gv"], $currPhaseProfile["gw"], $currPhaseProfile["gp"], $currPhaseProfile["lx"], $currPhaseProfile["ptec"], $currPhaseProfile["trns"], $currPhaseProfile["shft"], $currPhaseProfile["sfec"], $currPhaseProfile["s/l"]);

                    $return["profile"] = array(
                        "gu" => $currPhaseProfile["gu"],
                        "gv" => $currPhaseProfile["gv"],
                        "gw" => $currPhaseProfile["gw"],
                        "gp" => $currPhaseProfile["gp"],
                        "lx" => $currPhaseProfile["lx"],
                        "ptec" => $currPhaseProfile["ptec"],
                        "trns" => $currPhaseProfile["trns"],
                        "shft" => $currPhaseProfile["shft"],
                        "sfec" => $currPhaseProfile["sfec"],
                        "s/l" => $currPhaseProfile["s/l"]
                    );

                    $profileLine = 2;
                } else {
                    if ($nS_hkl <= 8) {
                        /* If the number os S_hkl is equal or lower than eight, then we only need to read one more line of coefficients.
                           There are the following possible number of S_hkl lower than or equal to 8: 2, 3, 4, 5, 6. */
                        switch($nS_hkl) {
                            case 2: {
                                sscanf($line, " Value    : %f %f %f %f ", $currPhaseProfile["h/l"], $currPhaseProfile["eta"], $currPhaseProfile["s1"], $currPhaseProfile["s2"]);
                                $return["profile"]["h/l"] = $currPhaseProfile["h/l"];
                                $return["profile"]["eta"] = $currPhaseProfile["eta"];
                                $return["profile"]["s1"] = $currPhaseProfile["s1"];
                                $return["profile"]["s2"] = $currPhaseProfile["s2"];
                                break;
                            }
                            case 3: {
                                sscanf($line, " Value    : %f %f %f %f %f ", $currPhaseProfile["h/l"], $currPhaseProfile["eta"], $currPhaseProfile["s1"], $currPhaseProfile["s2"], $currPhaseProfile["s3"]);
                                $return["profile"]["h/l"] = $currPhaseProfile["h/l"];
                                $return["profile"]["eta"] = $currPhaseProfile["eta"];
                                $return["profile"]["s1"] = $currPhaseProfile["s1"];
                                $return["profile"]["s2"] = $currPhaseProfile["s2"];
                                $return["profile"]["s3"] = $currPhaseProfile["s3"];
                                break;
                            }
                            case 4: {
                                sscanf($line, " Value    : %f %f %f %f %f %f ", $currPhaseProfile["h/l"], $currPhaseProfile["eta"], $currPhaseProfile["s1"], $currPhaseProfile["s2"], $currPhaseProfile["s3"], $currPhaseProfile["s4"]);
                                $return["profile"]["h/l"] = $currPhaseProfile["h/l"];
                                $return["profile"]["eta"] = $currPhaseProfile["eta"];
                                $return["profile"]["s1"] = $currPhaseProfile["s1"];
                                $return["profile"]["s2"] = $currPhaseProfile["s2"];
                                $return["profile"]["s3"] = $currPhaseProfile["s3"];
                                $return["profile"]["s4"] = $currPhaseProfile["s4"];
                                break;
                            }
                            case 5: {
                                sscanf($line, " Value    : %f %f %f %f %f %f %f ", $currPhaseProfile["h/l"], $currPhaseProfile["eta"], $currPhaseProfile["s1"], $currPhaseProfile["s2"], $currPhaseProfile["s3"], $currPhaseProfile["s4"], $currPhaseProfile["s5"]);
                                $return["profile"]["h/l"] = $currPhaseProfile["h/l"];
                                $return["profile"]["eta"] = $currPhaseProfile["eta"];
                                $return["profile"]["s1"] = $currPhaseProfile["s1"];
                                $return["profile"]["s2"] = $currPhaseProfile["s2"];
                                $return["profile"]["s3"] = $currPhaseProfile["s3"];
                                $return["profile"]["s4"] = $currPhaseProfile["s4"];
                                $return["profile"]["s5"] = $currPhaseProfile["s5"];
                                break;
                            }
                            case 6: {
                                sscanf($line, " Value    : %f %f %f %f %f %f %f %f ", $currPhaseProfile["h/l"], $currPhaseProfile["eta"], $currPhaseProfile["s1"], $currPhaseProfile["s2"], $currPhaseProfile["s3"], $currPhaseProfile["s4"], $currPhaseProfile["s5"], $currPhaseProfile["s6"]);
                                $return["profile"]["h/l"] = $currPhaseProfile["h/l"];
                                $return["profile"]["eta"] = $currPhaseProfile["eta"];
                                $return["profile"]["s1"] = $currPhaseProfile["s1"];
                                $return["profile"]["s2"] = $currPhaseProfile["s2"];
                                $return["profile"]["s3"] = $currPhaseProfile["s3"];
                                $return["profile"]["s4"] = $currPhaseProfile["s4"];
                                $return["profile"]["s5"] = $currPhaseProfile["s5"];
                                $return["profile"]["s6"] = $currPhaseProfile["s6"];
                                break;
                            }
                        }

                        /* We're done, the object is complete, we can now end the search. */
                        $profileFound = false;
                    } else {
                    /* Otherwise, we will need to read a third line of values.
                       There are the following possible number of S_hkl greater than 8: 9, 15. */

                        /* If we have not started reading S_hkl values, let's do it reading the first line of S_hkl values. */
                        if ($profileLine == 2) {
                            /* Read the whole line, it will be the same for any amount of values greater than 8. */
                            sscanf($line, " Value    : %f %f %f %f %f %f %f %f %f %f %f ", $currPhaseProfile["h/l"], $currPhaseProfile["eta"], $currPhaseProfile["s1"], $currPhaseProfile["s2"], $currPhaseProfile["s3"], $currPhaseProfile["s4"], $currPhaseProfile["s5"], $currPhaseProfile["s6"], $currPhaseProfile["s7"], $currPhaseProfile["s8"]);
                            $return["profile"]["h/l"] = $currPhaseProfile["h/l"];
                            $return["profile"]["eta"] = $currPhaseProfile["eta"];
                            $return["profile"]["s1"] = $currPhaseProfile["s1"];
                            $return["profile"]["s2"] = $currPhaseProfile["s2"];
                            $return["profile"]["s3"] = $currPhaseProfile["s3"];
                            $return["profile"]["s4"] = $currPhaseProfile["s4"];
                            $return["profile"]["s5"] = $currPhaseProfile["s5"];
                            $return["profile"]["s6"] = $currPhaseProfile["s6"];
                            $return["profile"]["s7"] = $currPhaseProfile["s7"];
                            $return["profile"]["s8"] = $currPhaseProfile["s8"];
                        } else {
                        /* If we have, then we just read the last line. It is assured that we can have a maximum of three lines to read. */
                            switch($nS_hkl) {
                                case 9: {
                                    sscanf($line, " Value    : %f ", $currPhaseProfile["s9"]);
                                    $return["profile"]["s9"] = $currPhaseProfile["s9"];
                                    break;
                                }

                                case 15: {
                                    sscanf($line, " Value    : %f %f %f %f %f %f %f ", $currPhaseProfile["s9"], $currPhaseProfile["s10"], $currPhaseProfile["s11"], $currPhaseProfile["s12"], $currPhaseProfile["s13"], $currPhaseProfile["s14"], $currPhaseProfile["s15"]);
                                    $return["profile"]["s9"] = $currPhaseProfile["s9"];
                                    $return["profile"]["s10"] = $currPhaseProfile["s10"];
                                    $return["profile"]["s11"] = $currPhaseProfile["s11"];
                                    $return["profile"]["s12"] = $currPhaseProfile["s12"];
                                    $return["profile"]["s13"] = $currPhaseProfile["s13"];
                                    $return["profile"]["s14"] = $currPhaseProfile["s14"];
                                    $return["profile"]["s15"] = $currPhaseProfile["s15"];
                                    break;
                                }
                            }

                            /* And then we're done and can end the search for values. */
                            $profileFound = false;
                        }

                    }
                }
            }
        }



        $k++;
    }
    //echo "\n: Foram lidas " . $k . " linhas.\n";



    //sscanf($f[51], "%d %d %d %d %d %d %e %e %e %e %e %e %e %e %e %e", $i, $h, $k, $l, $mul, $icod, $dspace, $fosq, $Fcsq, $FoTsq, $FcTsq, $Phas, $I100, $Prfo, $Trans, $Extc);

    $return["nPhases"] = $numberOfPhases;

    echo json_encode($return);
    //echo print_r($f);
}

if (isset($q) && $q == "uploadRFLFile") {

    header('Content-Type: application/json');

    $fileTempName = $_FILES["inputFile"]["tmp_name"];

    $file = fopen($fileTempName, 'r');
    $fileLines = file($fileTempName);

    /*
     * Main JSON object. It has the following structure:
     *
     * {
     *    n : {
     *       h : n,
     *       k : n,
     *       l : n,
     *       M : n,
     *       sth/lam : n,
     *       tth : n,
     *       fwhm : n,
     *       FoSq : n,
     *       sig : n,
     *       fobs : n,
     *       obs : n,
     *       phase : n
     *    }
     * }
     */
    $return = array();

    $symmetry = isset($_POST["symmetry"]) ? $_POST["symmetry"] : null;

    $i = 0;

    $nLines = count($fileLines);
    //$return["nLines"] = $nLines;

    foreach ($fileLines as $line) {
        if ($i != 0 and $i < $nLines - 1) {

            sscanf($line, "   %d   %d   %d       %d %f   %f    %f %f %f   %d   0   %f", $h, $k, $l, $m, $sthlam, $tth, $fwhm, $fosq, $sig, $fobs, $phase);

            //$lineValues = explode(" ", $line);

            //$return[$i] = $lineValues;

            $return[$i] = array(
                "h" => $h,
                "k" => $k,
                "l" => $l,
                "m" => $m,
                "sthlam" => $sthlam,
                "tth" => $tth,
                "fwhm" => $fwhm,
                "fosq" => $fosq,
                "sig" => $sig,
                "fobs" => $fobs,
                "phase" => $phase,
                "s_shkl" => null
            );
        }

        $i++;
    }
    //echo "\n: Foram lidas " . $i . " linhas.\n";
    echo json_encode($return);
    //echo print_r($f);
}

?>