document.addEventListener('DOMContentLoaded',function() {
    document.querySelector('select[name="examples"]').onchange=exampleSelected;
    var button = document.getElementById("buttonRun");
    button.addEventListener("click", runCode);
},false);

// cpu running flag
var running = false;
// cpu lib
var lib = {}
// code editor
var code = false;

// change example code
function exampleSelected(arg) {
    var val = event.target.value;
    var input = document.getElementById("code");
    if (val == "Fibonacci") {
        editor.setValue(EX_FIB, -1);
        input.value = EX_FIB;
    }
    else if (val == "Sum") {
        editor.setValue(EX_SUM, -1);
        input.value = EX_SUM;
    }
}

// js cpu step
function cpustep() {
    var end = lib.stepCPU(lib.cpu);
    showRegs();
    if (end) {
        var input = document.getElementById("buttonRun");
        input.innerHTML = 'Run';
        running = false;
    }
    else
        setTimeout(cpustep, 1);
}

// js cpu init
function runCode() {
    if (!running) {
        initRegs();
        var ret = lib.initCPU(lib.cpu, editor.getValue(), 0, 30);
        setTimeout(cpustep, 10);
        var input = document.getElementById("buttonRun");
        input.innerHTML = '<i class="fas fa-spinner fa-pulse"></i>';
        running = true;
    }
}

function initRegs() {
    for (var i=0; i<32; i++)
        lib.setReg(lib.cpu, i, 0);
}

function showRegs() {
    for (var i=0; i<32; i++) {
        var divReg = document.getElementById('r' + i);
        divReg.value = lib.getReg(lib.cpu, i);
    }
}

window.onload = function() {
    //
    editor = ace.edit("editor");
    editor.setTheme("ace/theme/tomorrow");
    editor.session.setMode("ace/mode/c_cpp");
    document.getElementById('editor').style.fontSize='14px';
    // load lib
    lib.getReg = Module.cwrap('get_reg', 'number', ['pointer', 'number']);
    lib.getVersion = Module.cwrap('get_version', 'string', []);
    lib.makeCPU = Module.cwrap('make_cpu', 'pointer', []);
    lib.stepCPU = Module.cwrap('step', null, ['pointer']);
    lib.initCPU = Module.cwrap('init', null, ['pointer', 'string']);
    lib.setReg = Module.cwrap('set_reg', null, ['pointer', 'number', 'number']);
    lib.cpu = lib.makeCPU();
    // Write version
    var divVersion = document.getElementById('version');
    divVersion.innerHTML = '(build ' + lib.getVersion() + ')';
    // Init and show regs
    initRegs();
    showRegs();
}

var EX_SUM = `// <main>:
0xff 0x01 0x01 0x13 // addi	sp,sp,-16
0x00 0x81 0x26 0x23 // sw	s0,12(sp)
0x01 0x01 0x04 0x13 // addi	s0,sp,16
0x02 0xa0 0x07 0x93 // li	a5,42
0x00 0x07 0x85 0x13 // mv	a0,a5
0x00 0xc1 0x24 0x03 // lw	s0,12(sp)
0x01 0x01 0x01 0x13 // addi	sp,sp,16
0x00 0x00 0x80 0x67 // ret`


var EX_FIB = `// <main>:
0xff 0x01 0x01 0x13 // addi	sp,sp,-16
0x00 0x11 0x26 0x23 // sw	ra,12(sp)
0x00 0xa0 0x05 0x13 // li   a0,10
0x01 0x00 0x00 0xef // jal	ra,101b8 <fib>
0x00 0xc1 0x20 0x83 // lw	ra,12(sp)
0x01 0x01 0x01 0x13 // addi	sp,sp,16
0x00 0x00 0x80 0x67 // ret

// <fib>:
0x00 0x10 0x07 0x93 // li	a5,1
0x00 0xa7 0xc6 0x63 // blt	a5,a0,101c8 <fib+0x10>
0x00 0x10 0x05 0x13 // li	a0,1
0x00 0x00 0x80 0x67 // ret
0xff 0x01 0x01 0x13 // addi	sp,sp,-16
0x00 0x11 0x26 0x23 // sw	ra,12(sp)
0x00 0x81 0x24 0x23 // sw	s0,8(sp)
0x00 0x91 0x22 0x23 // sw	s1,4(sp)
0x00 0x05 0x04 0x13 // mv	s0,a0
0xff 0xf5 0x05 0x13 // addi	a0,a0,-1
0xfd 0x9f 0xf0 0xef // jal	ra,101b8 <fib>
0x00 0x05 0x04 0x93 // mv	s1,a0
0xff 0xe4 0x05 0x13 // addi	a0,s0,-2
0xfc 0xdf 0xf0 0xef // jal	ra,101b8 <fib>
0x00 0xa4 0x85 0x33 // add	a0,s1,a0
0x00 0xc1 0x20 0x83 // lw	ra,12(sp)
0x00 0x81 0x24 0x03 // lw	s0,8(sp)
0x00 0x41 0x24 0x83 // lw	s1,4(sp)
0x01 0x01 0x01 0x13 // addi	sp,sp,16
0x00 0x00 0x80 0x67 // ret`;
