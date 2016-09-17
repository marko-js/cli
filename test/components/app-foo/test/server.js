var expect = require('chai').expect;

test('raw html matches', (ctx) => {
    expect(ctx.renderString({ name:'Bob' })).to.equal('<div class="foo">Hello Bob</div>');
    expect(ctx.renderString({ name:'Frank' })).to.equal('<div class="foo">Hello Frank</div>');
});

test('cheerio text selector matches', (ctx) => {
    var $ = ctx.renderDOM({ name:'Sallie' });
    expect($('div.foo').text()).to.equal('Hello Sallie');
});

test('async test', (ctx, done) => {
    var $ = ctx.renderDOM({ name:'Async' });
    expect($('div.foo').text()).to.equal('Hello Async');
    done();
});

test('pending test');